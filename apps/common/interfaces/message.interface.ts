export interface BroadcastMessageInterface {
  channel: string;
  id: string;
  message: string;
}

export interface ResponseMessageInterface {
  message: BroadcastMessageInterface;
  isSuccess: boolean;
}
