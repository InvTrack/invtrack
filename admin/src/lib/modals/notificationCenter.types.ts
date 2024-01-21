export type Notification = LowQuantityNotification | OtherNotification;

type NotificationName = { name: string };
type LowQuantityNotification = {
  type: "low_quantity";
  data: { quantity: number; notificationThreshold: number; unit: string };
} & NotificationName;
type OtherNotification = {
  type: "other";
  data: { text: string };
} & NotificationName;
