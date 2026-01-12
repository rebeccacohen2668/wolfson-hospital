
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { APP_CONFIG } from './constants';
import { StageId, ChatMessage, Variables, QuestionLog, ButtonAction } from './types';

const App: React.FC = () => {
  const [currentStageId, setCurrentStageId] = useState<StageId>(APP_CONFIG.startState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [variables, setVariables] = useState<Variables>(APP_CONFIG.variables);
  
  // Use a ref to always have access to the latest variables in callbacks and timeouts
  const variablesRef = useRef<Variables>(APP_CONFIG.variables);
  const currentStageIdRef = useRef<StageId>(APP_CONFIG.startState);

  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [questionsLog, setQuestionsLog] = useState<QuestionLog[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showExcel, setShowExcel] = useState(false);
  
  const [pendingNextStage, setPendingNextStage] = useState<StageId | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync refs with state
  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  useEffect(() => {
    currentStageIdRef.current = currentStageId;
  }, [currentStageId]);

  // Find the ID of the last bot message to determine which buttons to show
  const lastBotMessageId = useMemo(() => {
    const botMessages = messages.filter(m => m.sender === 'bot');
    return botMessages.length > 0 ? botMessages[botMessages.length - 1].id : null;
  }, [messages]);

  // Helper to calculate days between today and target date
  const calculateDaysLeft = (dateStr: string | null) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusLine = (vars: Variables) => {
    const preopDays = vars.preop_days_manual !== null ? vars.preop_days_manual : calculateDaysLeft(vars.preop_date);
    const surgeryDays = vars.surgery_days_manual !== null ? vars.surgery_days_manual : calculateDaysLeft(vars.surgery_date);
    
    let lines = [];
    if (vars.preop_date || vars.preop_days_manual !== null) {
      lines.push(`🩺 טרום-ניתוח: ${formatDate(vars.preop_date) || '—'} | ⏳ נשארו: ${preopDays !== null ? (preopDays === 0 ? 'היום' : preopDays < 0 ? 'עבר' : preopDays) : '—'} ימים`);
    }
    if (vars.surgery_date || vars.surgery_days_manual !== null) {
      lines.push(`📅 ניתוח: ${formatDate(vars.surgery_date) || '—'} | ⏳ נשארו: ${surgeryDays !== null ? (surgeryDays === 0 ? 'היום' : surgeryDays < 0 ? 'עבר' : surgeryDays) : '—'} ימים`);
    }
    return lines;
  };

  const replaceTemplates = useCallback((str: string, vars: Variables & { stageName?: string }) => {
    let result = str;
    const preopDays = vars.preop_days_manual !== null ? vars.preop_days_manual : calculateDaysLeft(vars.preop_date);
    const surgeryDays = vars.surgery_days_manual !== null ? vars.surgery_days_manual : calculateDaysLeft(vars.surgery_date);

    const allVars: any = { 
      ...vars,
      preop_date: formatDate(vars.preop_date),
      surgery_date: formatDate(vars.surgery_date),
      preop_days: preopDays !== null ? (preopDays === 0 ? 'היום' : preopDays < 0 ? 'עבר' : preopDays) : '—',
      surgery_days_left: surgeryDays !== null ? (surgeryDays === 0 ? 'היום' : surgeryDays < 0 ? 'עבר' : surgeryDays) : '—'
    };
    
    Object.keys(allVars).forEach(key => {
      const val = allVars[key] !== null && allVars[key] !== undefined && allVars[key] !== '' ? allVars[key] : 'טרם נקבע';
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
    });
    return result;
  }, []);

  const handleStageTransition = useCallback((nextId: StageId) => {
    setCurrentStageId(nextId);
    const stage = (APP_CONFIG.states as any)[nextId];
    if (!stage) return;

    let messageText = '';
    let buttons: readonly ButtonAction[] = [];

    const activeVars = variablesRef.current;

    if (stage.type === 'CONDITION') {
      const conditionStage = stage as any;
      let foundCase = null;
      if (nextId === 'STAGE_4') {
        foundCase = activeVars.preop_date || activeVars.preop_date_exists 
          ? conditionStage.cases.find((c: any) => c.when === 'preop_date_exists')
          : conditionStage.cases.find((c: any) => c.when === 'preop_date_missing');
      } else if (nextId === 'STAGE_6') {
        if (activeVars.missing_docs) {
          foundCase = conditionStage.cases.find((c: any) => c.when === 'missing_docs');
        } else if (activeVars.surgery_date || activeVars.surgery_days_manual !== null) {
          foundCase = conditionStage.cases.find((c: any) => c.when === 'surgery_date_exists');
        } else {
          foundCase = conditionStage.cases.find((c: any) => c.when === 'surgery_date_missing');
        }
      }

      messageText = (conditionStage.baseMessage ? conditionStage.baseMessage + '\n\n' : '') + 
                    (foundCase?.message || '');
      buttons = foundCase?.buttons || conditionStage.baseButtons || [];
      
      if (foundCase?.next && !foundCase.message) {
        handleStageTransition(foundCase.next);
        return;
      }
    } else {
      messageText = stage.message;
      buttons = stage.buttons;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: replaceTemplates(messageText, { ...activeVars, stageName: stage.stageName }),
      sender: 'bot',
      timestamp: new Date(),
      buttons
    };

    setMessages(prev => [...prev, newMessage]);
  }, [replaceTemplates]);

  useEffect(() => {
    const stage = (APP_CONFIG.states as any)[APP_CONFIG.startState];
    if (stage) {
      setMessages([{
        id: '1',
        text: replaceTemplates(stage.message, variablesRef.current),
        sender: 'bot',
        timestamp: new Date(),
        buttons: stage.buttons
      }]);
    }
  }, [replaceTemplates]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleButtonClick = (btn: ButtonAction) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: btn.label,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    if (btn.action === 'QUESTION') {
      setIsQuestionMode(true);
      return;
    }

    if (btn.action === 'RETRY_STAGE' && pendingNextStage) {
      const next = pendingNextStage;
      setPendingNextStage(null);
      setTimeout(() => handleStageTransition(next), 600);
      return;
    }

    const isNotReadyTrigger = 
      (btn.label.includes('לא') && btn.label !== 'לא נדרש') || 
      btn.label.includes('ממתין') || 
      btn.label.includes('בהמשך');

    if (isNotReadyTrigger && btn.next) {
      const lastBotMsg = [...messages].reverse().find(m => m.sender === 'bot');
      const originalText = lastBotMsg?.text || "";
      setPendingNextStage(btn.next); 
      
      setTimeout(() => {
        const feedbackMsg: ChatMessage = {
          id: `feed-${Date.now()}`,
          text: APP_CONFIG.feedbackMessages.notReady,
          sender: 'bot',
          timestamp: new Date(),
          buttons: [{ label: 'הבנתי', action: 'RETRY_STAGE' }]
        };
        setMessages(prev => [...prev, feedbackMsg]);

        setTimeout(() => {
          setMessages(currentMessages => {
            if (currentMessages.some(m => m.sender === 'user' && m.text === 'הבנתי')) return currentMessages;

            const reminderGreeting: ChatMessage = {
              id: `rem-greet-${Date.now()}`,
              text: replaceTemplates(APP_CONFIG.feedbackMessages.reminder, variablesRef.current),
              sender: 'bot',
              timestamp: new Date()
            };
            const reminderContent: ChatMessage = {
              id: `rem-content-${Date.now()}`,
              text: originalText,
              sender: 'bot',
              timestamp: new Date(),
              buttons: [
                { label: 'בוצע כבר', action: 'RETRY_STAGE' },
                { label: 'אעשה בהמשך', action: 'RETRY_STAGE' },
                { label: 'יש לי שאלה', action: 'QUESTION' }
              ]
            };
            return [...currentMessages, reminderGreeting, reminderContent];
          });
        }, 8000); 

      }, 800);
      return;
    }

    if (btn.next) {
      setTimeout(() => handleStageTransition(btn.next!), 600);
    }
  };

  const handleSendQuestion = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `q-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      isQuestion: true
    };
    setMessages(prev => [...prev, userMsg]);

    const activeVars = variablesRef.current;
    const stage = (APP_CONFIG.states as any)[currentStageId];
    const stageName = stage ? stage.stageName : 'לא ידוע';

    setQuestionsLog(prev => [{
      id: Date.now().toString(),
      stageName,
      patientName: activeVars.name,
      phone: activeVars.phone,
      surgeryDate: formatDate(activeVars.surgery_date) || 'טרם נקבע',
      text: inputText,
      timestamp: new Date().toLocaleString('he-IL')
    }, ...prev]);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-q-${Date.now()}`,
        text: APP_CONFIG.question.botMessage,
        sender: 'bot',
        timestamp: new Date(),
        buttons: stage?.buttons || []
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);

    setInputText('');
    setIsQuestionMode(false);
  };

  const updateAdminField = (key: keyof Variables, val: any) => {
    const updatedVars = { ...variablesRef.current, [key]: val };
    
    // Automatic calculation when date changes
    if (key === 'preop_date') {
      const calculated = calculateDaysLeft(val);
      updatedVars.preop_days_manual = calculated;
      if (val) updatedVars.preop_date_exists = true;
    } else if (key === 'surgery_date') {
      const calculated = calculateDaysLeft(val);
      updatedVars.surgery_days_manual = calculated;
    }
    
    setVariables(updatedVars);
  };

  const handleAdminSave = () => {
    setShowAdmin(false);
    const activeVars = variablesRef.current;
    
    let parts = [];
    if (activeVars.preop_date) parts.push(`טרום-ניתוח: ${formatDate(activeVars.preop_date)}`);
    if (activeVars.surgery_date) parts.push(`ניתוח: ${formatDate(activeVars.surgery_date)}`);
    
    if (parts.length > 0) {
      const sysMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        text: `עודכן במערכת: ${parts.join(' | ')}`,
        sender: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, sysMsg]);
    }

    // Auto-advance logic: If we provided missing data that was blocking a stage
    setTimeout(() => {
      const curStage = currentStageIdRef.current;
      // If waiting for surgery date
      if ((curStage === 'WAIT_SURGERY_DATE' || curStage === 'STAGE_6') && (activeVars.surgery_date || activeVars.surgery_days_manual !== null)) {
        handleStageTransition('STAGE_6');
      }
      // If waiting for preop date
      else if ((curStage === 'STAGE_4' || curStage === 'STAGE_4_APPOINTMENT_CHECK') && (activeVars.preop_date || activeVars.preop_days_manual !== null)) {
        handleStageTransition('STAGE_4');
      }
    }, 1000);
  };

  const advanceDay = () => {
    const activeVars = variablesRef.current;
    const curPreop = activeVars.preop_days_manual !== null ? activeVars.preop_days_manual : calculateDaysLeft(activeVars.preop_date);
    const curSurgery = activeVars.surgery_days_manual !== null ? activeVars.surgery_days_manual : calculateDaysLeft(activeVars.surgery_date);

    const nextPreop = curPreop !== null ? Math.max(0, curPreop - 1) : null;
    const nextSurgery = curSurgery !== null ? Math.max(0, curSurgery - 1) : null;

    const newVars = {
      ...activeVars,
      preop_days_manual: nextPreop,
      surgery_days_manual: nextSurgery
    };
    setVariables(newVars);

    const sysMsg: ChatMessage = {
      id: `sys-adv-${Date.now()}`,
      text: `עודכן במערכת: ירד יום אחד. טרום-ניתוח: ${nextPreop !== null ? nextPreop : '—'} ימים | ניתוח: ${nextSurgery !== null ? nextSurgery : '—'} ימים`,
      sender: 'system',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto relative shadow-2xl overflow-hidden bg-white">
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 shadow-md z-20 shrink-0">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200">
          <img src="https://files.oaiusercontent.com/file-D7YhW9oU3pL9fX6p5vV8V3?se=2025-01-30T13%3A32%3A05Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D45f1b14a-502a-4318-912b-31cc3849f136.webp&sig=6I0H%2BxK0Z5P5m6z4q7gL7W1u2%2BNt7t0p6%2B6m7o5W3mQ%3D" alt="Wolfson Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-none">ליווי ניתוח - וולפסון</h1>
          <p className="text-xs opacity-80">מחלקת אף אוזן גרון</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowAdmin(true)} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-xs transition-colors">
             <i className="fa-solid fa-cog"></i>
             <span>עדכון מרפאה</span>
           </button>
           <button onClick={() => setShowExcel(!showExcel)} className="hover:opacity-70 text-lg"><i className="fa-solid fa-file-excel"></i></button>
        </div>
      </div>

      {/* Status Bar Overlay */}
      {(variables.surgery_date || variables.preop_date || variables.surgery_days_manual !== null || variables.preop_days_manual !== null) && (
        <div className="bg-[#128c7e] text-white text-[10px] px-3 py-1 flex justify-center items-center z-10 font-bold border-t border-[#064e46] shrink-0 animate-in slide-in-from-top text-center">
          {replaceTemplates(APP_CONFIG.statusBar.template, variables)}
        </div>
      )}

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 whatsapp-bg relative">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-2 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[#d1eaed] text-[#4a4a4a] text-[11px] px-4 py-1.5 rounded-full shadow-sm font-semibold border border-white/50 text-center">
                  {msg.text}
                </div>
              </div>
            );
          }

          const botStatusLines = msg.sender === 'bot' ? getStatusLine(variables) : [];
          const isLastBotMessage = msg.id === lastBotMessageId;

          return (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
              <div className={`max-w-[85%] p-3 shadow-sm relative ${msg.sender === 'user' ? 'bg-[#dcf8c6] text-gray-800 message-bubble-user' : 'bg-white text-gray-800 message-bubble-bot animate-in fade-in slide-in-from-bottom-2'}`}>
                {msg.sender === 'bot' && botStatusLines.length > 0 && (
                  <div className="mb-2 pb-2 border-b border-gray-100 flex flex-col gap-0.5">
                    {botStatusLines.map((line, i) => (
                      <div key={i} className="text-[10px] font-bold text-[#128c7e] leading-tight">{line}</div>
                    ))}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <div className="text-[10px] text-gray-500 text-left mt-1 opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.sender === 'bot' && msg.buttons && msg.buttons.length > 0 && isLastBotMessage && (
                <div className="flex flex-wrap gap-2 mt-3 justify-end w-full">
                  {msg.buttons.map((btn, idx) => (
                    <button key={idx} onClick={() => handleButtonClick(btn)} className="bg-white text-[#128c7e] text-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-all font-semibold active:scale-95">
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t z-20 shrink-0">
        <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-inner">
          <input 
            type="text" 
            placeholder={isQuestionMode ? "הקלידו את השאלה כאן..." : "הקלידו הודעה..."}
            className="w-full text-sm outline-none bg-transparent"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (isQuestionMode ? handleSendQuestion() : null)}
          />
        </div>
        <button onClick={() => isQuestionMode ? handleSendQuestion() : setIsQuestionMode(true)} className="w-10 h-10 bg-[#128c7e] text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform">
          <i className={`fa-solid ${isQuestionMode ? 'fa-paper-plane' : 'fa-microphone'}`}></i>
        </button>
      </div>

      {/* Admin Modal */}
      {showAdmin && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in">
            <div className="bg-[#075e54] text-white p-4 flex justify-between items-center">
              <h2 className="font-bold">{APP_CONFIG.adminDemo.modalTitle}</h2>
              <button onClick={() => setShowAdmin(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[10px] text-gray-400 mb-2">* בדמו זה, הזנת תאריכים תחשב אוטומטית את הימים שנשארו. ניתן עדיין לעקוף ידנית.</p>
              {APP_CONFIG.adminDemo.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{field.label}</label>
                  <input 
                    type={field.type} 
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#128c7e] outline-none" 
                    value={(variables as any)[field.key] || ''} 
                    onChange={(e) => updateAdminField(field.key as any, field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} 
                  />
                </div>
              ))}
              
              <div className="flex gap-2 pt-2 border-t mt-4">
                <button 
                  onClick={advanceDay} 
                  className="flex-1 bg-orange-100 text-orange-700 py-2 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors"
                >
                  <i className="fa-solid fa-forward mr-1"></i>
                  העבר יום קדימה
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowAdmin(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold shadow-sm active:bg-gray-200 transition-colors">ביטול</button>
                <button onClick={handleAdminSave} className="flex-1 bg-[#128c7e] text-white py-3 rounded-lg font-bold shadow-md active:bg-[#075e54] transition-colors">שמור</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Sheet Overlay */}
      {showExcel && (
        <div className="absolute inset-0 z-40 bg-white flex flex-col animate-in slide-in-from-bottom">
           <div className="bg-green-700 text-white p-4 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-2 font-bold">
               <i className="fa-solid fa-file-excel text-xl"></i>
               <h2>תיעוד שאלות מחלקה (Excel)</h2>
             </div>
             <button onClick={() => setShowExcel(false)} className="bg-white/20 px-3 py-1 rounded">סגור</button>
           </div>
           <div className="flex-1 overflow-auto p-2">
             <table className="w-full text-xs text-right border-collapse">
               <thead>
                 <tr className="bg-gray-100 sticky top-0">
                   <th className="border p-2">תאריך</th>
                   <th className="border p-2">שלב</th>
                   <th className="border p-2">מטופל</th>
                   <th className="border p-2">שאלה</th>
                 </tr>
               </thead>
               <tbody>
                 {questionsLog.length === 0 ? (
                   <tr><td colSpan={4} className="text-center p-10 text-gray-400 italic">טרם התקבלו שאלות מהמטופלים</td></tr>
                 ) : (
                   questionsLog.map(log => (
                     <tr key={log.id} className="hover:bg-gray-50">
                       <td className="border p-2">{log.timestamp}</td>
                       <td className="border p-2 font-medium">{log.stageName}</td>
                       <td className="border p-2">{log.patientName}</td>
                       <td className="border p-2 whitespace-pre-wrap">{log.text}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
           <div className="p-2 bg-gray-50 text-[10px] text-gray-500 border-t shrink-0">
             * מסד הנתונים מסונכרן אוטומטית למזכירות מחלקת אא"ג.
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
