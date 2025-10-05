
// نظام تخزين البيانات المحلي
export interface Student {
  id: string;
  name: string;
  username: string;
  password: string;
  photo?: string;
  gender: 'male' | 'female';
  birthDate: string;
  age: number;
  phone: string;
  parentPhone: string;
  educationLevel: 'preparatory' | 'secondary';
  grade: string; // "الأولى الإعدادي", "الثانية الإعدادي", "الثالثة الإعدادي", "الأولى الثانوي", "الثانية الثانوي", "الثالثة الثانوي"
  selectedSubjects: string[];
  totalPrice: number;
  hasPaid: boolean;
  paidSubjects: string[];
  enrolledSubjects: string[];
  schedule: ClassSchedule[];
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string;
  photo?: string;
  phone: string;
  subjects: string[];
  schedule: ClassSchedule[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  educationLevel: 'preparatory' | 'secondary';
  grade: string[];
}

export interface ClassSchedule {
  id: string;
  subjectId: string;
  teacherId: string;
  studentIds: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface ScheduleType {
  id: string;
  subjectId: string;
  teacherId: string;
  studentIds: string[];
  scheduleType: 'weekly' | 'single';
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  startDate: string;
  endDate?: string; // للجلسات الأسبوعية
}

export interface CenterData {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  schedules: ClassSchedule[];
  customSchedules: ScheduleType[];
}

// البيانات الافتراضية
const defaultData: CenterData = {
  students: [
    {
      id: "1",
      name: "أحمد محمد",
      username: "ahmed123",
      password: "123456",
      photo: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face",
      gender: "male" as const,
      birthDate: "2007-05-15",
      age: 17,
      phone: "01234567890",
      parentPhone: "01098765432",
      educationLevel: "secondary" as const,
      grade: "الثانية الثانوي",
      selectedSubjects: ["1", "2"],
      totalPrice: 950,
      hasPaid: true,
      paidSubjects: ["1", "2"],
      enrolledSubjects: ["1", "2"],
      schedule: []
    },
    {
      id: "2", 
      name: "فاطمة علي",
      username: "fatima456",
      password: "123456",
      photo: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=150&h=150&fit=crop&crop=face",
      gender: "female" as const,
      birthDate: "2008-03-20",
      age: 16,
      phone: "01156789012",
      parentPhone: "01012345678",
      educationLevel: "secondary" as const,
      grade: "الأولى الثانوي",
      selectedSubjects: ["1"],
      totalPrice: 500,
      hasPaid: false,
      paidSubjects: [],
      enrolledSubjects: ["1"],
      schedule: []
    },
    {
      id: "3", 
      name: "علي حسن",
      username: "ali789",
      password: "123456",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      gender: "male" as const,
      birthDate: "2009-07-10",
      age: 15,
      phone: "01098765432",
      parentPhone: "01123456789",
      educationLevel: "preparatory" as const,
      grade: "الثالثة الإعدادي",
      selectedSubjects: ["3", "4"],
      totalPrice: 850,
      hasPaid: true,
      paidSubjects: ["3", "4"],
      enrolledSubjects: ["3", "4"],
      schedule: []
    }
  ],
  teachers: [
    {
      id: "1",
      name: "د. محمد أحمد",
      email: "mohamed@teacher.com", 
      password: "123456",
      photo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop&crop=face",
      phone: "01567890123",
      subjects: ["1", "2", "3"],
      schedule: []
    },
    {
      id: "2",
      name: "أ. سارة محمود",
      email: "sara@teacher.com", 
      password: "123456",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      phone: "01234567890",
      subjects: ["4", "5"],
      schedule: []
    }
  ],
  subjects: [
    {
      id: "1",
      name: "الرياضيات",
      description: "مادة الرياضيات للثانوية العامة",
      price: 500,
      duration: "شهر",
      educationLevel: "secondary" as const,
      grade: ["الأولى الثانوي", "الثانية الثانوي", "الثالثة الثانوي"]
    },
    {
      id: "2", 
      name: "الفيزياء",
      description: "مادة الفيزياء للثانوية العامة",
      price: 450,
      duration: "شهر",
      educationLevel: "secondary" as const,
      grade: ["الثانية الثانوي", "الثالثة الثانوي"]
    },
    {
      id: "3",
      name: "الجبر",
      description: "مادة الجبر للمرحلة الإعدادية",
      price: 400,
      duration: "شهر",
      educationLevel: "preparatory" as const,
      grade: ["الثانية الإعدادي", "الثالثة الإعدادي"]
    },
    {
      id: "4",
      name: "الهندسة",
      description: "مادة الهندسة للمرحلة الإعدادية والثانوية",
      price: 450,
      duration: "شهر",
      educationLevel: "preparatory" as const,
      grade: ["الثالثة الإعدادي"]
    },
    {
      id: "5",
      name: "الكيمياء",
      description: "مادة الكيمياء للثانوية العامة",
      price: 500,
      duration: "شهر",
      educationLevel: "secondary" as const,
      grade: ["الثانية الثانوي", "الثالثة الثانوي"]
    }
  ],
  schedules: [],
  customSchedules: [
    {
      id: "1",
      subjectId: "1",
      teacherId: "1",
      studentIds: ["1"],
      scheduleType: "weekly",
      dayOfWeek: "sunday",
      startTime: "09:00",
      endTime: "10:30",
      room: "قاعة 1",
      startDate: "2024-01-01",
      endDate: "2024-12-31"
    },
    {
      id: "2",
      subjectId: "2",
      teacherId: "1",
      studentIds: ["1"],
      scheduleType: "weekly",
      dayOfWeek: "monday",
      startTime: "14:00",
      endTime: "15:30",
      room: "قاعة 2",
      startDate: "2024-01-01",
      endDate: "2024-12-31"
    },
    {
      id: "3",
      subjectId: "3",
      teacherId: "1",
      studentIds: ["2"],
      scheduleType: "single",
      dayOfWeek: "tuesday",
      startTime: "16:00",
      endTime: "17:30",
      room: "قاعة 3",
      startDate: "2024-01-15"
    },
    {
      id: "4",
      subjectId: "4",
      teacherId: "2",
      studentIds: ["3"],
      scheduleType: "weekly",
      dayOfWeek: "wednesday",
      startTime: "10:00",
      endTime: "11:30",
      room: "قاعة 4",
      startDate: "2024-01-01",
      endDate: "2024-12-31"
    }
  ]
};

// تحديد مسار ملف البيانات
const DATA_FILE_KEY = 'center_data';

// وظائف إدارة البيانات
export const loadData = (): CenterData => {
  try {
    const stored = localStorage.getItem(DATA_FILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return defaultData;
};

export const saveData = (data: CenterData): void => {
  try {
    localStorage.setItem(DATA_FILE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// وظائف مساعدة للطلاب
export const addStudent = (student: Omit<Student, 'id'>): void => {
  const data = loadData();
  const newStudent: Student = {
    ...student,
    id: Date.now().toString()
  };
  data.students.push(newStudent);
  saveData(data);
};

export const getStudent = (username: string, password: string): Student | null => {
  const data = loadData();
  return data.students.find(s => s.username === username && s.password === password) || null;
};

// وظائف مساعدة للمدرسين  
export const addTeacher = (teacher: Omit<Teacher, 'id'>): void => {
  const data = loadData();
  const newTeacher: Teacher = {
    ...teacher,
    id: Date.now().toString()
  };
  data.teachers.push(newTeacher);
  saveData(data);
};

export const getTeacher = (email: string, password: string): Teacher | null => {
  const data = loadData();
  return data.teachers.find(t => t.email === email && t.password === password) || null;
};

// وظائف مساعدة للمواد
export const addSubject = (subject: Omit<Subject, 'id'>): void => {
  const data = loadData();
  const newSubject: Subject = {
    ...subject,
    id: Date.now().toString()
  };
  data.subjects.push(newSubject);
  saveData(data);
};

// دالة لحساب العمر من تاريخ الميلاد
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// دالة لحساب السعر الإجمالي للمواد المختارة
export const calculateTotalPrice = (selectedSubjectIds: string[]): number => {
  const data = loadData();
  return selectedSubjectIds.reduce((total, subjectId) => {
    const subject = data.subjects.find(s => s.id === subjectId);
    return total + (subject?.price || 0);
  }, 0);
};

export const getSubjects = (): Subject[] => {
  const data = loadData();
  return data.subjects;
};

export const getTeachers = (): Teacher[] => {
  const data = loadData();
  return data.teachers;
};

export const getStudents = (): Student[] => {
  const data = loadData();
  return data.students;
};

export const addSchedule = (schedule: Omit<ScheduleType, 'id'>): void => {
  const data = loadData();
  const newSchedule: ScheduleType = {
    ...schedule,
    id: Date.now().toString()
  };
  data.customSchedules.push(newSchedule);
  saveData(data);
};

export const getSchedules = (): ScheduleType[] => {
  const data = loadData();
  return data.customSchedules || [];
};

// دالة تحديث طالب
export const updateStudent = (id: string, updatedStudent: Partial<Student>): void => {
  const data = loadData();
  const index = data.students.findIndex(s => s.id === id);
  if (index !== -1) {
    data.students[index] = { ...data.students[index], ...updatedStudent };
    saveData(data);
  }
};

// دالة حذف طالب
export const deleteStudent = (id: string): void => {
  const data = loadData();
  data.students = data.students.filter(s => s.id !== id);
  saveData(data);
};

// دالة تحديث مدرس
export const updateTeacher = (id: string, updatedTeacher: Partial<Teacher>): void => {
  const data = loadData();
  const index = data.teachers.findIndex(t => t.id === id);
  if (index !== -1) {
    data.teachers[index] = { ...data.teachers[index], ...updatedTeacher };
    saveData(data);
  }
};

// دالة حذف مدرس
export const deleteTeacher = (id: string): void => {
  const data = loadData();
  data.teachers = data.teachers.filter(t => t.id !== id);
  saveData(data);
};

// دالة تحديث مادة
export const updateSubject = (id: string, updatedSubject: Partial<Subject>): void => {
  const data = loadData();
  const index = data.subjects.findIndex(s => s.id === id);
  if (index !== -1) {
    data.subjects[index] = { ...data.subjects[index], ...updatedSubject };
    saveData(data);
  }
};

// دالة حذف مادة
export const deleteSubject = (id: string): void => {
  const data = loadData();
  data.subjects = data.subjects.filter(s => s.id !== id);
  saveData(data);
};

// دالة تحديث موعد
export const updateSchedule = (id: string, updatedSchedule: Partial<ScheduleType>): void => {
  const data = loadData();
  const index = data.customSchedules.findIndex(s => s.id === id);
  if (index !== -1) {
    data.customSchedules[index] = { ...data.customSchedules[index], ...updatedSchedule };
    saveData(data);
  }
};

// دالة حذف موعد
export const deleteSchedule = (id: string): void => {
  const data = loadData();
  data.customSchedules = data.customSchedules.filter(s => s.id !== id);
  saveData(data);
};
