// Email validation utility
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Event submission validation utility
export interface Event {
  type: "1:1" | "group";
  can_multiple_vote?: boolean;
}

export const validateSubmission = (
  isAnonymous: boolean,
  name: string,
  email: string,
  selectedSlots: Record<string, boolean>,
  event: Event
): { isValid: boolean; error?: string } => {
  // Check if any time slots are selected
  const hasSelectedSlots = Object.values(selectedSlots).some(Boolean);
  if (!hasSelectedSlots) {
    return { isValid: false, error: "Please select at least one time slot" };
  }

  // For non-anonymous submissions, validate name and email
  if (!isAnonymous) {
    if (!name.trim()) {
      return { isValid: false, error: "Please enter your name" };
    }

    if (!email.trim()) {
      return { isValid: false, error: "Please enter your email address" };
    }

    if (!isValidEmail(email)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }
  }

  // For 1:1 events, validate single slot selection
  if (event.type === "1:1") {
    const selectedCount = Object.values(selectedSlots).filter(Boolean).length;
    if (selectedCount > 1) {
      return { isValid: false, error: "Please select only one time slot for 1:1 events" };
    }
  }

  // For group events with multiple votes disabled
  if (event.type === "group" && !event.can_multiple_vote) {
    const selectedCount = Object.values(selectedSlots).filter(Boolean).length;
    if (selectedCount > 1) {
      return { isValid: false, error: "Multiple time slot selection is not allowed for this event" };
    }
  }

  return { isValid: true };
};

// Time slot validation utility
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DateTimeSlot {
  date: Date;
  timeSlots: TimeSlot[];
}

export const checkTimeConflicts = (slots: DateTimeSlot[]): boolean => {
  for (const dateSlot of slots) {
    const sortedTimeSlots = [...dateSlot.timeSlots].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    for (let i = 0; i < sortedTimeSlots.length - 1; i++) {
      const currentSlot = sortedTimeSlots[i];
      const nextSlot = sortedTimeSlots[i + 1];

      if (currentSlot.endTime > nextSlot.startTime) {
        return true;
      }
    }
  }
  return false;
};

// Past date validation utility
export const hasPastDates = (slots: DateTimeSlot[]): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  for (const slot of slots) {
    const date = new Date(slot.date);
    date.setHours(0, 0, 0, 0);
    
    if (date < now) {
      return true;
    }
  }
  return false;
};

// 1:1 event validation utility
export interface EventFormData {
  type: "1:1" | "group";
  dateTimeSlots: DateTimeSlot[];
}

export const validate1on1Event = (formData: EventFormData): boolean => {
  if (formData.type === "1:1") {
    const totalSlots = formData.dateTimeSlots.reduce(
      (sum, date) => sum + date.timeSlots.length,
      0
    );
    
    if (totalSlots > 10) {
      return false;
    }
  }
  return true;
};

// Past time validation utility
export const isPastTime = (date: Date, time: string): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const compareDate = new Date(date);
  compareDate.setHours(hours, minutes);
  return compareDate < now;
};

// Time slot gap validation utility (for 1:1 events)
export const validateTimeSlotGaps = (dateSlot: DateTimeSlot): boolean => {
  const sortedSlots = [...dateSlot.timeSlots].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  for (let i = 0; i < sortedSlots.length - 1; i++) {
    const currentEnd = new Date(`2000-01-01T${sortedSlots[i].endTime}`);
    const nextStart = new Date(`2000-01-01T${sortedSlots[i + 1].startTime}`);
    const diffInMinutes = (nextStart.getTime() - currentEnd.getTime()) / 1000 / 60;

    if (diffInMinutes < 30) {
      return false;
    }
  }
  return true;
};

// Random string generation utility
export const generateRandomString = (length: number): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Password strength validation utility
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation utility
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return { isValid: false, error: "Name cannot be empty" };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: "Name must be less than 50 characters" };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  return { isValid: true };
}; 