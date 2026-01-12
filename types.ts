
export type StageId = 
  | 'STAGE_1' | 'STAGE_2' | 'STAGE_3_LABS' | 'STAGE_3_SPECIALISTS' 
  | 'STAGE_3_IMAGING' | 'STAGE_3_HEARING' | 'STAGE_3_FORM17_PREOP' 
  | 'STAGE_4' | 'STAGE_4_APPOINTMENT_CHECK' | 'STAGE_5' | 'STAGE_5_IN_CLINIC_1' 
  | 'STAGE_5_IN_CLINIC_2' | 'STAGE_5_IN_CLINIC_3' | 'STAGE_5_IN_CLINIC_4' 
  | 'STAGE_6' | 'WAIT_SURGERY_DATE' | 'STAGE_7_READY' | 'STAGE_8_PREP' 
  | 'STAGE_8_TWO_DAYS_BEFORE' | 'STAGE_8_EVE_BEFORE' | 'STAGE_9' | 'STAGE_FINISH' | 'NOT_DONE_CALM';

export interface Variables {
  name: string;
  phone: string;
  preop_date: string | null;
  preop_days: string | number; // This acts as the display value
  preop_days_manual: number | null; // Manual override
  preop_date_exists?: boolean;
  surgery_date: string | null;
  surgery_days_left: number | null; // Manual override or calc
  surgery_days_manual: number | null; // Manual override
  missing_docs_deadline: string;
  missing_docs?: boolean;
}

export interface ButtonAction {
  label: string;
  next?: StageId;
  action?: 'QUESTION' | 'RETRY_STAGE' | 'MARK_DONE' | 'SET_PENDING_TASK';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user' | 'system';
  timestamp: Date;
  buttons?: readonly ButtonAction[];
  isQuestion?: boolean;
}

export interface QuestionLog {
  id: string;
  stageName: string;
  patientName: string;
  phone: string;
  surgeryDate: string;
  text: string;
  timestamp: string;
}
