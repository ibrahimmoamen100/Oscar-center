import React, { useState, useEffect } from 'react';
import { Plus, Users, BookOpen, User, UserCog, Calendar, Phone, Edit, Trash2, Save, X, CheckCircle, Clock, Search, Filter, GraduationCap, School, MapPin, BarChart3 } from 'lucide-react';
import { addStudent, addTeacher, addSubject, getTeachers, getSubjects, getAllData, calculateAge, calculateTotalPrice, getStudents, addSchedule, getSchedules, updateStudent, deleteStudent, updateTeacher, deleteTeacher, updateSubject, deleteSubject, updateSchedule, deleteSchedule, getMessages, addMessage, updateMessage, deleteMessage, cleanupExpiredSchedules } from '../data/api';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { MultiSelect } from '../components/ui/multi-select';
import { Modal } from '../components/ui/modal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'subjects' | 'schedules' | 'messages'>('students');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  // تحديث البيانات عند تحميل الصفحة
  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersData, subjectsData, studentsData, schedulesData, messagesData] = await Promise.all([
          getTeachers(),
          getSubjects(),
          getStudents(),
          getSchedules(),
          getMessages()
        ]);
        setTeachers(teachersData);
        setSubjects(subjectsData);
        setStudents(studentsData);
        setSchedules(schedulesData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('حدث خطأ في تحميل البيانات');
      }
    };
    
    loadData();
  }, []);
  
  // State for editing modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<'student' | 'teacher' | 'subject' | 'schedule' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  
  // State for attendance management
  const [attendanceData, setAttendanceData] = useState<{[scheduleId: string]: {[studentId: string]: boolean}}>({});
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedScheduleForAttendance, setSelectedScheduleForAttendance] = useState<string | null>(null);
  
  // State for calendar modal
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  
  // State for detail modals
  const [studentsDetailModalOpen, setStudentsDetailModalOpen] = useState(false);
  const [teachersDetailModalOpen, setTeachersDetailModalOpen] = useState(false);
  const [subjectsDetailModalOpen, setSubjectsDetailModalOpen] = useState(false);
  const [messagesDetailModalOpen, setMessagesDetailModalOpen] = useState(false);
  
  // State for filters
  const [studentsFilter, setStudentsFilter] = useState('');
  const [teachersFilter, setTeachersFilter] = useState('');
  const [subjectsFilter, setSubjectsFilter] = useState('');
  const [schedulesFilter, setSchedulesFilter] = useState('');
  const [messagesFilter, setMessagesFilter] = useState('');
  
  // Advanced filters for students
  const [educationLevelFilter, setEducationLevelFilter] = useState<'all' | 'preparatory' | 'secondary'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  
  // Advanced filters for teachers
  const [teacherEducationLevelFilter, setTeacherEducationLevelFilter] = useState<'all' | 'preparatory' | 'secondary'>('all');
  const [teacherGradeFilter, setTeacherGradeFilter] = useState<string>('all');
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState<string>('all');
  
  // State to check username availability
  const [usernameError, setUsernameError] = useState('');

  // State for messages
  const [messages, setMessages] = useState<any[]>([]);
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    targetType: 'all_students' as 'all_students' | 'all_teachers' | 'preparatory_students' | 'secondary_students' | 'specific_grade' | 'specific_subject_grade' | 'specific_teacher_subject' | 'specific_schedule',
    targetValue: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isActive: true
  });
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20; // عدد الطلاب في كل صفحة
  
  // State for pagination - Teachers
  const [currentTeachersPage, setCurrentTeachersPage] = useState(1);
  const teachersPerPage = 10; // عدد المدرسين في كل صفحة
  
  // State for pagination - Subjects
  const [currentSubjectsPage, setCurrentSubjectsPage] = useState(1);
  const subjectsPerPage = 12; // عدد المواد في كل صفحة
  
  // State for pagination - Schedules
  const [currentSchedulesPage, setCurrentSchedulesPage] = useState(1);
  const schedulesPerPage = 15; // عدد المواعيد في كل صفحة
  
  // State for pagination - Messages
  const [currentMessagesPage, setCurrentMessagesPage] = useState(1);
  const messagesPerPage = 10; // عدد الرسائل في كل صفحة

  // حساب عدد الطلاب المتوقعين للحضور
  const getExpectedStudents = (subjectId: string, teacherId: string) => {
    // الحصول على معلومات المادة
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return [];

    // الحصول على معلومات المدرس
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return [];

    return students.filter(student => {
      // التحقق من أن الطالب يدرس المادة
      const hasSubject = student.selectedSubjects.includes(subjectId);
      
      // التحقق من أن الطالب دفع للمادة
      const hasPaid = student.hasPaid && student.paidSubjects.includes(subjectId);
      
      // التحقق من المرحلة التعليمية
      const educationLevelMatch = student.educationLevel === subject.educationLevel;
      
      // التحقق من الصف (إذا كانت المادة محددة لصف معين)
      const gradeMatch = subject.grade.length === 0 || subject.grade.includes(student.grade);
      
      // التحقق من أن المدرس يدرس هذه المادة
      const teacherSubjectMatch = teacher.subjects.includes(subjectId);
      
      return hasSubject && hasPaid && educationLevelMatch && gradeMatch && teacherSubjectMatch;
    });
  };

  // حساب عدد الحلقات للمواعيد الأسبوعية
  const calculateWeeklySessions = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  // فحص إذا كان الموعد قد انتهى
  const isScheduleExpired = (schedule: any) => {
    // الحصول على التاريخ الحالي بشكل صحيح
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    // استخدام التاريخ الحالي الفعلي بدلاً من التاريخ الافتراضي
    const currentDate = todayString;
    
    if (schedule.scheduleType === 'single') {
      // المواعيد المنفردة تنتهي إذا كان تاريخها أقل من التاريخ الحالي
      const isExpired = schedule.startDate < currentDate;

      return isExpired;
    } else if (schedule.scheduleType === 'weekly' && schedule.endDate) {
      // المواعيد الأسبوعية تنتهي إذا كان تاريخ انتهائها أقل من التاريخ الحالي
      // لكن يجب أن تكون قد بدأت أيضاً
      const hasStarted = schedule.startDate <= currentDate;
      const hasEnded = schedule.endDate < currentDate;
      const isExpired = hasStarted && hasEnded;

      return isExpired;
    }
    return false;
  };

  // دالة للتحقق من صلاحية الموعد في تاريخ محدد
  const isScheduleValidForDate = (schedule: any, date: Date) => {
    if (schedule.scheduleType === 'single') {
      const scheduleDate = new Date(schedule.startDate);
      return scheduleDate.toDateString() === date.toDateString();
    } else if (schedule.scheduleType === 'weekly') {
      const startDate = new Date(schedule.startDate);
      const endDate = schedule.endDate ? new Date(schedule.endDate) : null;
      
      // التحقق من أن التاريخ ضمن فترة الصلاحية
      if (endDate && date > endDate) {
        return false;
      }
      
      if (date < startDate) {
        return false;
      }
      
      return true;
    }
    return false;
  };

  // تحديث حالة الحضور
  const updateAttendance = (scheduleId: string, studentId: string, isPresent: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        [studentId]: isPresent
      }
    }));
  };

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    username: '',
    password: '',
    photo: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    age: 0,
    phone: '',
    parentPhone: '',
    educationLevel: 'secondary' as 'preparatory' | 'secondary',
    grade: '',
    selectedSubjects: [] as string[],
    totalPrice: 0,
    hasPaid: false,
    paidSubjects: [] as string[],
    enrolledSubjects: [] as string[],
    monthStartDate: '',
    monthEndDate: '',
    points: 0,
    notes: '',
    certificates: [] as string[]
  });

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    photo: '',
    phone: '',
    subject: '' as string
  });

  // Subject form state
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '',
    educationLevel: 'secondary' as 'preparatory' | 'secondary',
    grade: '' as string
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    subjectId: '',
    teacherId: '',
    scheduleType: 'weekly' as 'weekly' | 'single',
    dayOfWeek: [] as string[],
    startTime: '',
    endTime: '',
    room: '',
    startDate: '',
    endDate: ''
  });

  // Get grades based on education level
  const getGradesForLevel = (level: 'preparatory' | 'secondary') => {
    if (level === 'preparatory') {
      return ['الأولى الإعدادي', 'الثانية الإعدادي', 'الثالثة الإعدادي'];
    } else {
      return ['الأولى الثانوي', 'الثانية الثانوي', 'الثالثة الثانوي'];
    }
  };

  // Get available subjects based on student's education level and grade
  const getAvailableSubjects = () => {
    return subjects.filter(subject => 
      subject.educationLevel === studentForm.educationLevel && 
      (Array.isArray(subject.grade) ? subject.grade.includes(studentForm.grade) : subject.grade === studentForm.grade)
    );
  };

  // Update age when birth date changes
  useEffect(() => {
    if (studentForm.birthDate) {
      const calculatedAge = calculateAge(studentForm.birthDate);
      setStudentForm(prev => ({ ...prev, age: calculatedAge }));
    }
  }, [studentForm.birthDate]);

  // Update total price when selected subjects change
  useEffect(() => {
    const updateTotalPrice = async () => {
      const totalPrice = await calculateTotalPrice(studentForm.selectedSubjects);
      setStudentForm(prev => ({ ...prev, totalPrice }));
    };
    updateTotalPrice();
  }, [studentForm.selectedSubjects]);

  // Update total price in edit modal when selected subjects change
  useEffect(() => {
    const updateEditTotalPrice = async () => {
      if (editingType === 'student' && editData.selectedSubjects) {
        const totalPrice = await calculateTotalPrice(editData.selectedSubjects);
        setEditData(prev => ({ ...prev, totalPrice }));
      }
    };
    updateEditTotalPrice();
  }, [editData.selectedSubjects, editingType]);

  // Update grade when education level changes
  useEffect(() => {
    setStudentForm(prev => ({ 
      ...prev, 
      grade: '',
      selectedSubjects: [],
      totalPrice: 0,
      monthStartDate: '',
      monthEndDate: ''
    }));
  }, [studentForm.educationLevel]);

  // حساب تاريخ نهاية الشهر تلقائياً عند تحديد تاريخ البداية
  useEffect(() => {
    if (studentForm.monthStartDate) {
      const startDate = new Date(studentForm.monthStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(startDate.getDate() - 1); // يوم واحد قبل نفس اليوم من الشهر التالي
      
      const endDateString = endDate.toISOString().split('T')[0];
      setStudentForm(prev => ({ ...prev, monthEndDate: endDateString }));
    }
  }, [studentForm.monthStartDate]);

  // دالة للتحقق من انتهاء الشهر وتحديث حالة الدفع
  const checkAndUpdatePaymentStatus = (student: any) => {
    if (student.monthEndDate && student.hasPaid) {
      const today = new Date();
      const endDate = new Date(student.monthEndDate);
      
      if (today > endDate) {
        // انتهى الشهر، تحويل حالة الدفع إلى غير مدفوع
        return {
          ...student,
          hasPaid: false,
          paidSubjects: []
        };
      }
    }
    return student;
  };

  // تحديث حالة الدفع للطلاب عند تحميل البيانات
  useEffect(() => {
    const updatedStudents = students.map(checkAndUpdatePaymentStatus);
    if (JSON.stringify(updatedStudents) !== JSON.stringify(students)) {
      setStudents(updatedStudents);
    }
  }, [students]);

  // Check username availability
  const checkUsernameAvailability = (username: string, type: 'student' | 'teacher') => {
    if (type === 'student') {
      const exists = students.some(student => student.username === username);
      setUsernameError(exists ? 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر' : '');
    } else {
      const exists = teachers.some(teacher => teacher.email === username);
      setUsernameError(exists ? 'البريد الإلكتروني موجود بالفعل، يرجى اختيار بريد آخر' : '');
    }
  };

  // Filter functions
  const getFilteredStudents = () => {
    return students.filter(student => {
      // Basic text filter
      const textMatch = 
        student.name.toLowerCase().includes(studentsFilter.toLowerCase()) ||
        student.username.toLowerCase().includes(studentsFilter.toLowerCase()) ||
        student.grade.toLowerCase().includes(studentsFilter.toLowerCase());
      
      // Education level filter
      const levelMatch = educationLevelFilter === 'all' || student.educationLevel === educationLevelFilter;
      
      // Grade filter
      const gradeMatch = gradeFilter === 'all' || student.grade === gradeFilter;
      
      // Payment filter
      const paymentMatch = paymentFilter === 'all' || 
        (paymentFilter === 'paid' && student.hasPaid) ||
        (paymentFilter === 'unpaid' && !student.hasPaid);
      
      // Gender filter
      const genderMatch = genderFilter === 'all' || student.gender === genderFilter;
      
      return textMatch && levelMatch && gradeMatch && paymentMatch && genderMatch;
    });
  };

  // Pagination functions for students
  const getPaginatedStudents = () => {
    const filteredStudents = getFilteredStudents();
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    return filteredStudents.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredStudents = getFilteredStudents();
    return Math.ceil(filteredStudents.length / studentsPerPage);
  };

  const nextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [studentsFilter, educationLevelFilter, gradeFilter, paymentFilter, genderFilter]);

  // Reset page when students data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [students]);

  // Pagination functions for teachers
  const getPaginatedTeachers = () => {
    const filteredTeachers = getFilteredTeachers();
    const startIndex = (currentTeachersPage - 1) * teachersPerPage;
    const endIndex = startIndex + teachersPerPage;
    return filteredTeachers.slice(startIndex, endIndex);
  };

  const getTotalTeachersPages = () => {
    const filteredTeachers = getFilteredTeachers();
    return Math.ceil(filteredTeachers.length / teachersPerPage);
  };

  const nextTeachersPage = () => {
    if (currentTeachersPage < getTotalTeachersPages()) {
      setCurrentTeachersPage(currentTeachersPage + 1);
    }
  };

  const prevTeachersPage = () => {
    if (currentTeachersPage > 1) {
      setCurrentTeachersPage(currentTeachersPage - 1);
    }
  };

  const goToTeachersPage = (page: number) => {
    setCurrentTeachersPage(page);
  };

  // Pagination functions for subjects
  const getPaginatedSubjects = () => {
    const filteredSubjects = getFilteredSubjects();
    const startIndex = (currentSubjectsPage - 1) * subjectsPerPage;
    const endIndex = startIndex + subjectsPerPage;
    return filteredSubjects.slice(startIndex, endIndex);
  };

  const getTotalSubjectsPages = () => {
    const filteredSubjects = getFilteredSubjects();
    return Math.ceil(filteredSubjects.length / subjectsPerPage);
  };

  const nextSubjectsPage = () => {
    if (currentSubjectsPage < getTotalSubjectsPages()) {
      setCurrentSubjectsPage(currentSubjectsPage + 1);
    }
  };

  const prevSubjectsPage = () => {
    if (currentSubjectsPage > 1) {
      setCurrentSubjectsPage(currentSubjectsPage - 1);
    }
  };

  const goToSubjectsPage = (page: number) => {
    setCurrentSubjectsPage(page);
  };

  // Pagination functions for schedules
  const getPaginatedSchedules = () => {
    const filteredSchedules = getFilteredSchedules();
    const startIndex = (currentSchedulesPage - 1) * schedulesPerPage;
    const endIndex = startIndex + schedulesPerPage;
    return filteredSchedules.slice(startIndex, endIndex);
  };

  const getTotalSchedulesPages = () => {
    const filteredSchedules = getFilteredSchedules();
    return Math.ceil(filteredSchedules.length / schedulesPerPage);
  };

  const nextSchedulesPage = () => {
    if (currentSchedulesPage < getTotalSchedulesPages()) {
      setCurrentSchedulesPage(currentSchedulesPage + 1);
    }
  };

  const prevSchedulesPage = () => {
    if (currentSchedulesPage > 1) {
      setCurrentSchedulesPage(currentSchedulesPage - 1);
    }
  };

  const goToSchedulesPage = (page: number) => {
    setCurrentSchedulesPage(page);
  };

  // Pagination functions for messages
  const getPaginatedMessages = () => {
    const filteredMessages = messages.filter(message => 
      message.title.toLowerCase().includes(messagesFilter.toLowerCase()) ||
      message.content.toLowerCase().includes(messagesFilter.toLowerCase())
    );
    const startIndex = (currentMessagesPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    return filteredMessages.slice(startIndex, endIndex);
  };

  const getTotalMessagesPages = () => {
    const filteredMessages = messages.filter(message => 
      message.title.toLowerCase().includes(messagesFilter.toLowerCase()) ||
      message.content.toLowerCase().includes(messagesFilter.toLowerCase())
    );
    return Math.ceil(filteredMessages.length / messagesPerPage);
  };

  const nextMessagesPage = () => {
    if (currentMessagesPage < getTotalMessagesPages()) {
      setCurrentMessagesPage(currentMessagesPage + 1);
    }
  };

  const prevMessagesPage = () => {
    if (currentMessagesPage > 1) {
      setCurrentMessagesPage(currentMessagesPage - 1);
    }
  };

  const goToMessagesPage = (page: number) => {
    setCurrentMessagesPage(page);
  };

  // Reset pages when filters change
  useEffect(() => {
    setCurrentTeachersPage(1);
  }, [teachersFilter, teacherEducationLevelFilter, teacherGradeFilter, teacherSubjectFilter]);

  useEffect(() => {
    setCurrentSubjectsPage(1);
  }, [subjectsFilter]);

  useEffect(() => {
    setCurrentSchedulesPage(1);
  }, [schedulesFilter]);

  useEffect(() => {
    setCurrentMessagesPage(1);
  }, [messagesFilter]);

  // Reset pages when data changes
  useEffect(() => {
    setCurrentTeachersPage(1);
  }, [teachers]);

  useEffect(() => {
    setCurrentSubjectsPage(1);
  }, [subjects]);

  useEffect(() => {
    setCurrentSchedulesPage(1);
  }, [schedules]);

  useEffect(() => {
    setCurrentMessagesPage(1);
  }, [messages]);

  // Helper function to render pagination
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onNext: () => void,
    onPrev: () => void,
    onGoToPage: (page: number) => void,
    totalItems: number,
    itemsPerPage: number,
    itemName: string
  ) => {
    if (totalItems <= itemsPerPage) return null;

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="mt-6 flex flex-col items-center">
        {/* معلومات الصفحة */}
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">
            عرض {startIndex} إلى {endIndex} من أصل {totalItems} {itemName}
          </p>
        </div>
        
        {/* أزرار التنقل */}
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          {/* زر الصفحة السابقة */}
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-all duration-300 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
            aria-label="الصفحة السابقة"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* أرقام الصفحات */}
          <div className="flex items-center space-x-1 space-x-reverse">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // عرض أرقام الصفحات مع إظهار "..." للصفحات الكثيرة
              if (totalPages <= 7) {
                return (
                  <button
                    key={page}
                    onClick={() => onGoToPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else {
                // عرض أرقام الصفحات مع "..." للصفحات الكثيرة
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => onGoToPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }
            })}
          </div>
          
          {/* زر الصفحة التالية */}
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-all duration-300 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
            aria-label="الصفحة التالية"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const getFilteredTeachers = () => {
    return teachers.filter(teacher => {
      // Basic text filter
      const textMatch = 
        teacher.name.toLowerCase().includes(teachersFilter.toLowerCase()) ||
        teacher.email.toLowerCase().includes(teachersFilter.toLowerCase());
      
      // Education level filter - check if teacher teaches subjects in this level
      const levelMatch = teacherEducationLevelFilter === 'all' || 
        (teacher.subjects && teacher.subjects.length > 0 && (() => {
          const subject = subjects.find(s => s.id === teacher.subjects[0]);
          return subject?.educationLevel === teacherEducationLevelFilter;
        })());
      
      // Grade filter - check if teacher teaches subjects for this grade
      const gradeMatch = teacherGradeFilter === 'all' || 
        (teacher.subjects && teacher.subjects.length > 0 && (() => {
          const subject = subjects.find(s => s.id === teacher.subjects[0]);
          return Array.isArray(subject?.grade) ? subject.grade.includes(teacherGradeFilter) : subject?.grade === teacherGradeFilter;
        })());
      
      // Subject filter
      const subjectMatch = teacherSubjectFilter === 'all' || 
        (teacher.subjects && teacher.subjects.includes(teacherSubjectFilter));
      
      return textMatch && levelMatch && gradeMatch && subjectMatch;
    });
  };

  const getFilteredSubjects = () => {
    return subjects.filter(subject => 
      subject.name.toLowerCase().includes(subjectsFilter.toLowerCase()) ||
      subject.description.toLowerCase().includes(subjectsFilter.toLowerCase())
    );
  };

  const getFilteredSchedules = () => {
    return schedules.filter(schedule => {
      const subject = subjects.find(s => s.id === schedule.subjectId);
      const teacher = teachers.find(t => t.id === schedule.teacherId);
      const searchTerm = schedulesFilter.toLowerCase();
      
      return (
        subject?.name.toLowerCase().includes(searchTerm) ||
        teacher?.name.toLowerCase().includes(searchTerm) ||
        (schedule.dayOfWeek && String(schedule.dayOfWeek).toLowerCase().includes(searchTerm)) ||
        (schedule.room && String(schedule.room).toLowerCase().includes(searchTerm))
      );
    });
  };

  // Get student breakdown by education level
  const getStudentBreakdown = () => {
    const preparatory = students.filter(s => s.educationLevel === 'preparatory').length;
    const secondary = students.filter(s => s.educationLevel === 'secondary').length;
    return { preparatory, secondary };
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check username availability
    const usernameExists = students.some(student => student.username === studentForm.username);
    if (usernameExists) {
      toast.error('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر');
      return;
    }
    
    try {
      // تحديث paidSubjects و enrolledSubjects بناءً على selectedSubjects و hasPaid
      const paidSubjects = studentForm.hasPaid ? studentForm.selectedSubjects : [];
      const enrolledSubjects = studentForm.selectedSubjects;
      

      
      const newStudent = await addStudent({
        ...studentForm,
        schedule: [],
        points: studentForm.points !== undefined ? studentForm.points : 0,
        notes: studentForm.notes !== undefined ? studentForm.notes : '',
        certificates: studentForm.certificates && Array.isArray(studentForm.certificates) ? studentForm.certificates : [],
        paidSubjects: paidSubjects,
        enrolledSubjects: enrolledSubjects
      });
      if (newStudent) {
        toast.success('تم إضافة الطالب بنجاح!');
        setStudentForm({
          name: '',
          username: '',
          password: '',
          photo: '',
          gender: 'male',
          birthDate: '',
          age: 0,
          phone: '',
          parentPhone: '',
          educationLevel: 'secondary',
          grade: '',
          selectedSubjects: [],
          totalPrice: 0,
          hasPaid: false,
          paidSubjects: [],
          enrolledSubjects: [],
          monthStartDate: '',
          monthEndDate: '',
          points: 0,
          notes: '',
          certificates: []
        });
        setUsernameError('');
        // Refresh students list
        const updatedStudents = await getStudents();
        setStudents(updatedStudents);
      } else {
        toast.error('فشل في إضافة الطالب');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة الطالب');
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check email availability
    const emailExists = teachers.some(teacher => teacher.email === teacherForm.email);
    if (emailExists) {
      toast.error('البريد الإلكتروني موجود بالفعل، يرجى اختيار بريد آخر');
      return;
    }
    
    try {
      // تحويل subject من string إلى array للتوافق مع API
      const teacherData = {
        ...teacherForm,
        subjects: [teacherForm.subject],
        schedule: []
      };
      const newTeacher = await addTeacher(teacherData);
      if (newTeacher) {
        toast.success('تم إضافة المدرس بنجاح!');
        setTeacherForm({
          name: '',
          email: '',
          password: '',
          photo: '',
          phone: '',
          subject: ''
        });
        setUsernameError('');
        // Refresh teachers list
        const updatedTeachers = await getTeachers();
        setTeachers(updatedTeachers);
      } else {
        toast.error('فشل في إضافة المدرس');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المدرس');
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // تحويل grade من string إلى array للتوافق مع API
      const subjectData = {
        ...subjectForm,
        grade: [subjectForm.grade]
      };
      const newSubject = await addSubject(subjectData);
      if (newSubject) {
        toast.success('تم إضافة المادة بنجاح!');
        setSubjectForm({
          name: '',
          description: '',
          price: 0,
          duration: '',
          educationLevel: 'secondary',
          grade: ''
        });
        // Refresh subjects list
        const updatedSubjects = await getSubjects();
        setSubjects(updatedSubjects);
      } else {
        toast.error('فشل في إضافة المادة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المادة');
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من اختيار يوم واحد على الأقل
    if (scheduleForm.dayOfWeek.length === 0) {
      toast.error('يرجى اختيار يوم واحد على الأقل');
      return;
    }
    
    try {
      // إضافة studentIds فارغ للتوافق مع API
      const scheduleData = {
        ...scheduleForm,
        studentIds: []
      };
      const newSchedule = await addSchedule(scheduleData);
      if (newSchedule) {
        toast.success('تم إضافة الموعد بنجاح!');
        setScheduleForm({
          subjectId: '',
          teacherId: '',
          scheduleType: 'weekly',
          dayOfWeek: [],
          startTime: '',
          endTime: '',
          room: '',
          startDate: '',
          endDate: ''
        });
        // Refresh schedules list
        const updatedSchedules = await getSchedules();
        setSchedules(updatedSchedules);
      } else {
        toast.error('فشل في إضافة الموعد');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة الموعد');
    }
  };

  // دوال التعديل والحذف
  const handleEdit = (type: 'student' | 'teacher' | 'subject' | 'schedule', id: string) => {
    let data;
    switch (type) {
      case 'student':
        data = students.find(s => s.id === id);
        break;
      case 'teacher':
        data = teachers.find(t => t.id === id);
        break;
      case 'subject':
        data = subjects.find(s => s.id === id);
        break;
      case 'schedule':
        data = schedules.find(s => s.id === id);
        break;
    }
    
    if (data) {
      setEditingType(type);
      setEditingId(id);
      setEditData({
        ...data,
        points: data.points !== undefined ? data.points : 0,
        notes: data.notes !== undefined ? data.notes : '',
        certificates: data.certificates && Array.isArray(data.certificates) ? data.certificates : [],
        // تحويل dayOfWeek إلى array إذا كان string
        dayOfWeek: Array.isArray(data.dayOfWeek) ? data.dayOfWeek : data.dayOfWeek ? [data.dayOfWeek] : []
      });
      setEditModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (!editingType || !editingId) return;
    
    try {
      let success = false;
      switch (editingType) {
        case 'student':
          // تحديث paidSubjects و enrolledSubjects بناءً على selectedSubjects و hasPaid
          const paidSubjects = editData.hasPaid ? (editData.selectedSubjects || []) : [];
          const enrolledSubjects = editData.selectedSubjects || [];
          

          
          const updatedStudent = await updateStudent(editingId, {
            ...editData,
            points: editData.points !== undefined ? editData.points : 0,
            notes: editData.notes !== undefined ? editData.notes : '',
            certificates: editData.certificates && Array.isArray(editData.certificates) ? editData.certificates : [],
            paidSubjects: paidSubjects,
            enrolledSubjects: enrolledSubjects
          });
          if (updatedStudent) {
            const updatedStudents = await getStudents();
            setStudents(updatedStudents);
            toast.success('تم تحديث الطالب بنجاح!');
            success = true;
          }
          break;
        case 'teacher':
          const updatedTeacher = await updateTeacher(editingId, editData);
          if (updatedTeacher) {
            const updatedTeachers = await getTeachers();
            setTeachers(updatedTeachers);
            toast.success('تم تحديث المدرس بنجاح!');
            success = true;
          }
          break;
        case 'subject':
          // تحويل grade من string إلى array للتوافق مع API
          const subjectUpdateData = {
            ...editData,
            grade: Array.isArray(editData.grade) ? editData.grade : [editData.grade]
          };
          const updatedSubject = await updateSubject(editingId, subjectUpdateData);
          if (updatedSubject) {
            const updatedSubjects = await getSubjects();
            setSubjects(updatedSubjects);
            toast.success('تم تحديث المادة بنجاح!');
            success = true;
          }
          break;
        case 'schedule':
          // التحقق من اختيار يوم واحد على الأقل
          const currentDays = Array.isArray(editData.dayOfWeek) ? editData.dayOfWeek : editData.dayOfWeek ? [editData.dayOfWeek] : [];
          if (currentDays.length === 0) {
            toast.error('يرجى اختيار يوم واحد على الأقل');
            return;
          }
          
          // تحويل dayOfWeek إلى array إذا لم يكن كذلك
          const scheduleUpdateData = {
            ...editData,
            dayOfWeek: currentDays
          };
          const updatedSchedule = await updateSchedule(editingId, scheduleUpdateData);
          if (updatedSchedule) {
            const updatedSchedules = await getSchedules();
            setSchedules(updatedSchedules);
            toast.success('تم تحديث الموعد بنجاح!');
            success = true;
          }
          break;
      }
      if (success) {
        handleCloseModal();
      } else {
        toast.error('فشل في التحديث');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingType(null);
    setEditingId(null);
    setEditData({
      points: 0,
      notes: '',
      certificates: [],
      dayOfWeek: []
    });
  };

  const handleAttendanceModal = (scheduleId: string) => {
    setSelectedScheduleForAttendance(scheduleId);
    setAttendanceModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      try {
        const success = await deleteStudent(id);
        if (success) {
          toast.success('تم حذف الطالب بنجاح!');
          const updatedStudents = await getStudents();
          setStudents(updatedStudents);
        } else {
          toast.error('فشل في حذف الطالب');
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الطالب');
      }
    }
  };


  const handleDeleteTeacher = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المدرس؟')) {
      try {
        const success = await deleteTeacher(id);
        if (success) {
          toast.success('تم حذف المدرس بنجاح!');
          const updatedTeachers = await getTeachers();
          setTeachers(updatedTeachers);
        } else {
          toast.error('فشل في حذف المدرس');
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف المدرس');
      }
    }
  };


  const handleDeleteSubject = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      try {
        const success = await deleteSubject(id);
        if (success) {
          toast.success('تم حذف المادة بنجاح!');
          const updatedSubjects = await getSubjects();
          setSubjects(updatedSubjects);
        } else {
          toast.error('فشل في حذف المادة');
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف المادة');
      }
    }
  };


  const handleDeleteSchedule = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      try {
        const success = await deleteSchedule(id);
        if (success) {
          toast.success('تم حذف الموعد بنجاح!');
          const updatedSchedules = await getSchedules();
          setSchedules(updatedSchedules);
        } else {
          toast.error('فشل في حذف الموعد');
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الموعد');
      }
    }
  };

  // ==================== دوال إدارة الرسائل ====================

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMessage = await addMessage(messageForm);
      if (newMessage) {
        const updatedMessages = await getMessages();
        setMessages(updatedMessages);
        setMessageForm({
          title: '',
          content: '',
          targetType: 'all_students',
          targetValue: '',
          priority: 'medium',
          isActive: true
        });
        toast.success('تم إضافة الرسالة بنجاح!');
      }
    } catch (error) {
      toast.error('حدث خطأ في إضافة الرسالة');
    }
  };

  const handleEditMessage = (message: any) => {
    setEditingMessage(message);
    setMessageForm({
      title: message.title,
      content: message.content,
      targetType: message.targetType,
      targetValue: message.targetValue || '',
      priority: message.priority,
      isActive: message.isActive
    });
    setMessageModalOpen(true);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage) return;
    try {
      const updatedMessage = await updateMessage(editingMessage.id, messageForm);
      if (updatedMessage) {
        const updatedMessages = await getMessages();
        setMessages(updatedMessages);
        setEditingMessage(null);
        setMessageModalOpen(false);
        setMessageForm({
          title: '',
          content: '',
          targetType: 'all_students',
          targetValue: '',
          priority: 'medium',
          isActive: true
        });
        toast.success('تم تحديث الرسالة بنجاح!');
      }
    } catch (error) {
      toast.error('حدث خطأ في تحديث الرسالة');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      try {
        await deleteMessage(id);
        const updatedMessages = await getMessages();
        setMessages(updatedMessages);
        toast.success('تم حذف الرسالة بنجاح!');
      } catch (error) {
        toast.error('حدث خطأ في حذف الرسالة');
      }
    }
  };

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'all_students': return 'جميع الطلاب';
      case 'all_teachers': return 'جميع المدرسين';
      case 'preparatory_students': return 'طلاب المرحلة الإعدادية';
      case 'secondary_students': return 'طلاب المرحلة الثانوية';
      case 'specific_grade': return 'صف محدد';
      case 'specific_subject_grade': return 'مادة محددة';
      case 'specific_teacher_subject': return 'مدرس مادة محددة';
      case 'specific_schedule': return 'موعد محدد';
      default: return targetType;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'عالية';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStudentForm = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="w-6 h-6 mr-3 text-blue-600" />
        إضافة طالب جديد
      </h2>
      
      <form onSubmit={handleAddStudent} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الطالب
            </label>
            <input
              type="text"
              value={studentForm.name}
              onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={studentForm.username}
              onChange={(e) => {
                setStudentForm({...studentForm, username: e.target.value});
                checkUsernameAvailability(e.target.value, 'student');
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                usernameError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={studentForm.password}
              onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الطالب
            </label>
            <select
              value={studentForm.gender}
              onChange={(e) => setStudentForm({...studentForm, gender: e.target.value as 'male' | 'female'})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الميلاد
            </label>
            <input
              type="date"
              value={studentForm.birthDate}
              onChange={(e) => setStudentForm({...studentForm, birthDate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العمر
            </label>
            <input
              type="number"
              value={studentForm.age}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المرحلة التعليمية
            </label>
            <select
              value={studentForm.educationLevel}
              onChange={(e) => setStudentForm({...studentForm, educationLevel: e.target.value as 'preparatory' | 'secondary'})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="preparatory">إعدادي</option>
              <option value="secondary">ثانوي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصف الدراسي
            </label>
            <select
              value={studentForm.grade}
              onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!studentForm.educationLevel}
            >
              <option value="">اختر الصف</option>
              {getGradesForLevel(studentForm.educationLevel).map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم هاتف الطالب
            </label>
            <input
              type="tel"
              value={studentForm.phone}
              onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم هاتف ولي الأمر
            </label>
            <input
              type="tel"
              value={studentForm.parentPhone}
              onChange={(e) => setStudentForm({...studentForm, parentPhone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الصورة
            </label>
            <input
              type="url"
              value={studentForm.photo}
              onChange={(e) => setStudentForm({...studentForm, photo: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/photo.jpg"
            />
            {/* معاينة الصورة */}
            {studentForm.photo && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">معاينة الصورة:</label>
                <div className="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={studentForm.photo}
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA1MkM1Mi40MTgzIDUyIDU2IDQ4LjQxODMgNTYgNDRDNTYgMzkuNTgxNyA1Mi40MTgzIDM2IDQ4IDM2QzQzLjU4MTcgMzYgNDAgMzkuNTgxNyA0MCA0NEM0MCA0OC40MTgzIDQzLjU4MTcgNTIgNDggNTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik00OCA1NkM0My41ODE3IDU2IDQwIDU5LjU4MTcgNDAgNjRINDhDNjAuOTI5IDY0IDgwIDU5LjU4MTcgODAgNTZDODAgNTIuNDE4MyA3Ni40MTgzIDQ5IDcyIDQ5SDQ4WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* المواد الدراسية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المواد الدراسية
          </label>
          <div className="grid gap-3">
            {getAvailableSubjects().map(subject => {
              const teacher = teachers.find(t => t.subjects.includes(subject.id));
              const isSelected = studentForm.selectedSubjects.includes(subject.id);
              
              return (
                <div
                  key={subject.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    const newSelectedSubjects = isSelected
                      ? studentForm.selectedSubjects.filter(id => id !== subject.id)
                      : [...studentForm.selectedSubjects, subject.id];
                    setStudentForm({...studentForm, selectedSubjects: newSelectedSubjects});
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-bold">{subject.price} جنيه</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="ml-3 w-5 h-5 text-blue-600"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{subject.description}</p>
                  {teacher && (
                    <div className="flex items-center text-green-600 text-sm">
                      <User className="w-4 h-4 mr-1" />
                      <span>المدرس: {teacher.name}</span>
                    </div>
                  )}
                  {!teacher && (
                    <div className="text-red-500 text-sm">
                      <span>لا يوجد مدرس متاح</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* الحقول الجديدة */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              النقاط
            </label>
            <div className="relative">
              <input
                type="number"
                                      value={studentForm.points !== undefined ? studentForm.points : 0}
                onChange={(e) => setStudentForm({...studentForm, points: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">النقاط التي حصل عليها الطالب من التفاعل والإنجازات</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الملاحظات
            </label>
            <textarea
              value={studentForm.notes !== undefined ? studentForm.notes : ''}
              onChange={(e) => setStudentForm({...studentForm, notes: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="ملاحظات حول الطالب..."
            />
            <p className="text-xs text-gray-500 mt-1">ملاحظات خاصة حول الطالب</p>
          </div>
        </div>

        {/* الشهادات */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الشهادات
          </label>
          <div className="space-y-3">
            {(studentForm.certificates && Array.isArray(studentForm.certificates) ? studentForm.certificates : []).map((certificate, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="url"
                    value={certificate}
                    onChange={(e) => {
                      const newCertificates = [...(studentForm.certificates && Array.isArray(studentForm.certificates) ? studentForm.certificates : [])];
                      newCertificates[index] = e.target.value;
                      setStudentForm({...studentForm, certificates: newCertificates});
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="رابط صورة الشهادة..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newCertificates = (studentForm.certificates && Array.isArray(studentForm.certificates) ? studentForm.certificates : []).filter((_, i) => i !== index);
                      setStudentForm({...studentForm, certificates: newCertificates});
                    }}
                    className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* معاينة الصورة */}
                {certificate && certificate.trim() !== '' && (
                  <div className="bg-primary from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <h4 className="text-sm font-semibold text-purple-800 mb-3 text-center">معاينة الشهادة {index + 1}</h4>
                    <div className="aspect-video bg-white rounded-lg overflow-hidden shadow-sm border border-purple-100">
                      <img
                        src={certificate}
                        alt={`معاينة شهادة ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTcgMTIwIDExOSAxMTEuNDU3IDExOSAxMDFDMTE5IDkwLjU0MzEgMTEwLjQ1NyA4MiAxMDAgODJDODkuNTQzMSA4MiA4MSA5MC41NDMxIDgxIDEwMUM4MSAxMTEuNDU3IDg5LjU0MzEgMTIwIDEwMCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzg5LjU0MzEgMTMwIDgxIDEzNy41NDMgODEgMTQ4SDEyMEMxMjAgMTM3LjU0MyAxMTEuNDU3IDEzMCAxMDAgMTMwWiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                    <div className="flex justify-center space-x-2 space-x-reverse mt-3">
                      <a
                        href={certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800 transition-colors bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200"
                      >
                        عرض الصورة
                      </a>
                      <button
                        type="button"
                        onClick={() => window.open(certificate, '_blank')}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200"
                      >
                        فتح في تبويب جديد
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setStudentForm({...studentForm, certificates: [...(studentForm.certificates && Array.isArray(studentForm.certificates) ? studentForm.certificates : []), '']})}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة شهادة جديدة
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">أضف روابط صور الشهادات التي حصل عليها الطالب</p>
        </div>

        {/* فترة الدفع الشهرية */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ بداية الشهر
            </label>
            <input
              type="date"
              value={studentForm.monthStartDate}
              onChange={(e) => setStudentForm({...studentForm, monthStartDate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">تاريخ بداية فترة الدفع الشهرية</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ نهاية الشهر
            </label>
            <input
              type="date"
              value={studentForm.monthEndDate}
              onChange={(e) => setStudentForm({...studentForm, monthEndDate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">تاريخ نهاية فترة الدفع الشهرية</p>
          </div>
        </div>

        {/* إجمالي السعر */}
        {studentForm.totalPrice > 0 && (
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">ملخص الرسوم</h3>
            <div className="space-y-1">
              {studentForm.selectedSubjects.map(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                return subject ? (
                  <div key={subjectId} className="flex justify-between text-blue-700">
                    <span>{subject.name}</span>
                    <span>{subject.price} جنيه</span>
                  </div>
                ) : null;
              })}
              <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-blue-800">
                <span>الإجمالي:</span>
                <span>{studentForm.totalPrice} جنيه</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasPaid"
            checked={studentForm.hasPaid}
            onChange={(e) => setStudentForm({...studentForm, hasPaid: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="hasPaid" className="mr-2 text-sm text-gray-700">
            دفع الرسوم
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
        >
          إضافة الطالب
        </button>
      </form>
    </div>
  );

  const renderTeacherForm = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <UserCog className="w-6 h-6 mr-3 text-green-600" />
        إضافة مدرس جديد
      </h2>
      
      <form onSubmit={handleAddTeacher} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المدرس
            </label>
            <input
              type="text"
              value={teacherForm.name}
              onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={teacherForm.email}
              onChange={(e) => {
                setTeacherForm({...teacherForm, email: e.target.value});
                checkUsernameAvailability(e.target.value, 'teacher');
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                usernameError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={teacherForm.password}
              onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={teacherForm.phone}
              onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الصورة
            </label>
            <input
              type="url"
              value={teacherForm.photo}
              onChange={(e) => setTeacherForm({...teacherForm, photo: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com/photo.jpg"
            />
            {/* معاينة الصورة */}
            {teacherForm.photo && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">معاينة الصورة:</label>
                <div className="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={teacherForm.photo}
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA1MkM1Mi40MTgzIDUyIDU2IDQ4LjQxODMgNTYgNDRDNTYgMzkuNTgxNyA1Mi40MTgzIDM2IDQ4IDM2QzQzLjU4MTcgMzYgNDAgMzkuNTgxNyA0MCA0NEM0MCA0OC40MTgzIDQzLjU4MTcgNTIgNDggNTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik00OCA1NkM0My41ODE3IDU2IDQwIDU5LjU4MTcgNDAgNjRINDhDNjAuOTI5IDY0IDgwIDU5LjU4MTcgODAgNTZDODAgNTIuNDE4MyA3Ni40MTgzIDQ5IDcyIDQ5SDQ4WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* المادة الخاصة بالمدرس */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المادة التي يدرسها
          </label>
          <select
            value={teacherForm.subject}
            onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">اختر المادة</option>
            {subjects.map(subject => {
              const subjectInfo = getSubjectInfo(subject.id);
              return (
                <option key={subject.id} value={subject.id}>
                  {subject.name} - {subjectInfo.educationLevel} - {subjectInfo.grade}
                </option>
              );
            })}
          </select>
          {teacherForm.subject && (
            <div className="mt-2 p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">تفاصيل المادة المختارة:</p>
              {(() => {
                const selectedSubject = subjects.find(s => s.id === teacherForm.subject);
                if (selectedSubject) {
                  const subjectInfo = getSubjectInfo(selectedSubject.id);
                  return (
                    <div className="text-sm text-green-700 space-y-1">
                      <div>• اسم المادة: {selectedSubject.name}</div>
                      <div>• المرحلة الدراسية: {subjectInfo.educationLevel}</div>
                      <div>• الصف: {subjectInfo.grade}</div>
                      <div>• السعر: {selectedSubject.price} جنيه</div>
                      <div>• المدة: {selectedSubject.duration}</div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
        >
          إضافة المدرس
        </button>
      </form>
    </div>
  );

  const renderSubjectForm = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <BookOpen className="w-6 h-6 mr-3 text-purple-600" />
        إضافة مادة جديدة
      </h2>
      
      <form onSubmit={handleAddSubject} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المادة
            </label>
            <input
              type="text"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السعر (بالجنيه)
            </label>
            <input
              type="number"
              value={subjectForm.price}
              onChange={(e) => setSubjectForm({...subjectForm, price: Number(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدة
            </label>
            <input
              type="text"
              value={subjectForm.duration}
              onChange={(e) => setSubjectForm({...subjectForm, duration: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="مثال: شهر، فصل دراسي، سنة"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المرحلة التعليمية
            </label>
            <select
              value={subjectForm.educationLevel}
                                    onChange={(e) => setSubjectForm({...subjectForm, educationLevel: e.target.value as 'preparatory' | 'secondary', grade: ''})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="preparatory">إعدادي</option>
              <option value="secondary">ثانوي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصف المتاح
            </label>
            <select
              value={subjectForm.grade}
              onChange={(e) => setSubjectForm({...subjectForm, grade: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">اختر الصف</option>
              {getGradesForLevel(subjectForm.educationLevel).map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وصف المادة
          </label>
          <textarea
            value={subjectForm.description}
            onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="اكتب وصفاً للمادة..."
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
        >
          إضافة المادة
        </button>
      </form>
    </div>
  );

  const renderMessageForm = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
        إضافة رسالة جديدة
      </h2>
      
      <form onSubmit={handleAddMessage} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الرسالة
            </label>
            <input
              type="text"
              value={messageForm.title}
              onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل عنوان الرسالة..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              أولوية الرسالة
            </label>
            <select
              value={messageForm.priority}
              onChange={(e) => setMessageForm({...messageForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            محتوى الرسالة
          </label>
          <textarea
            value={messageForm.content}
            onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="أدخل محتوى الرسالة..."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع المستهدفين
            </label>
            <select
              value={messageForm.targetType}
              onChange={(e) => setMessageForm({...messageForm, targetType: e.target.value as any, targetValue: ''})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="all_students">جميع الطلاب</option>
              <option value="all_teachers">جميع المدرسين</option>
              <option value="preparatory_students">طلاب المرحلة الإعدادية</option>
              <option value="secondary_students">طلاب المرحلة الثانوية</option>
              <option value="specific_grade">صف محدد</option>
              <option value="specific_subject_grade">مادة محددة</option>
              <option value="specific_teacher_subject">مدرس مادة محددة</option>
              <option value="specific_schedule">موعد محدد</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              القيمة المحددة
            </label>
            {messageForm.targetType === 'specific_grade' && (
              <select
                value={messageForm.targetValue}
                onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر الصف</option>
                <option value="الأولى الإعدادي">الأولى الإعدادي</option>
                <option value="الثانية الإعدادي">الثانية الإعدادي</option>
                <option value="الثالثة الإعدادي">الثالثة الإعدادي</option>
                <option value="الأولى الثانوي">الأولى الثانوي</option>
                <option value="الثانية الثانوي">الثانية الثانوي</option>
                <option value="الثالثة الثانوي">الثالثة الثانوي</option>
              </select>
            )}

            {messageForm.targetType === 'specific_subject_grade' && (
              <select
                value={messageForm.targetValue}
                onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر المادة</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            )}

            {messageForm.targetType === 'specific_teacher_subject' && (
              <select
                value={messageForm.targetValue}
                onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر المادة</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            )}

            {messageForm.targetType === 'specific_schedule' && (
              <select
                value={messageForm.targetValue}
                onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر الموعد</option>
                {schedules.map(schedule => {
                  const subject = subjects.find(s => s.id === schedule.subjectId);
                  const teacher = teachers.find(t => t.id === schedule.teacherId);
                  return (
                    <option key={schedule.id} value={schedule.id}>
                      {subject?.name} - {teacher?.name} - {schedule.dayOfWeek} {schedule.startTime}
                    </option>
                  );
                })}
              </select>
            )}

            {!['specific_grade', 'specific_subject_grade', 'specific_teacher_subject', 'specific_schedule'].includes(messageForm.targetType as string) && (
              <input
                type="text"
                value={messageForm.targetValue}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                placeholder="لا تحتاج لقيمة محددة"
              />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <input
            type="checkbox"
            id="isActive"
            checked={messageForm.isActive}
            onChange={(e) => setMessageForm({...messageForm, isActive: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            تفعيل الرسالة
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة الرسالة
          </button>
        </div>
      </form>
    </div>
  );

  const renderScheduleForm = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="w-6 h-6 mr-3 text-orange-600" />
        إضافة موعد جديد
      </h2>
      
      <form onSubmit={handleAddSchedule} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الموعد
            </label>
            <select
              value={scheduleForm.scheduleType}
              onChange={(e) => setScheduleForm({...scheduleForm, scheduleType: e.target.value as 'weekly' | 'single'})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="weekly">أسبوعي مستمر</option>
              <option value="single">حصة منفردة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المادة والمدرس
            </label>
            <select
              value={`${scheduleForm.subjectId}-${scheduleForm.teacherId}`}
              onChange={(e) => {
                const [subjectId, teacherId] = e.target.value.split('-');
                setScheduleForm({...scheduleForm, subjectId, teacherId});
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">اختر المادة والمدرس</option>
              {subjects.map(subject => 
                teachers
                  .filter(teacher => teacher.subjects.includes(subject.id))
                  .map(teacher => (
                    <option key={`${subject.id}-${teacher.id}`} value={`${subject.id}-${teacher.id}`}>
                      {subject.name} - {teacher.name} - {subject.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'} - {subject.grade.join(', ')}
                    </option>
                  ))
              ).flat()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              أيام الأسبوع
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'saturday', label: 'السبت' },
                  { value: 'sunday', label: 'الأحد' },
                  { value: 'monday', label: 'الاثنين' },
                  { value: 'tuesday', label: 'الثلاثاء' },
                  { value: 'wednesday', label: 'الأربعاء' },
                  { value: 'thursday', label: 'الخميس' },
                  { value: 'friday', label: 'الجمعة' }
                ].map(day => (
                  <label key={day.value} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Array.isArray(scheduleForm.dayOfWeek) 
                        ? scheduleForm.dayOfWeek.includes(day.value)
                        : scheduleForm.dayOfWeek === day.value
                      }
                      onChange={(e) => {
                        const currentDays = Array.isArray(scheduleForm.dayOfWeek) 
                          ? scheduleForm.dayOfWeek 
                          : scheduleForm.dayOfWeek ? [scheduleForm.dayOfWeek] : [];
                        
                        if (e.target.checked) {
                          setScheduleForm({
                            ...scheduleForm, 
                            dayOfWeek: [...currentDays, day.value]
                          });
                        } else {
                          setScheduleForm({
                            ...scheduleForm, 
                            dayOfWeek: currentDays.filter(d => d !== day.value)
                          });
                        }
                      }}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
              {Array.isArray(scheduleForm.dayOfWeek) && scheduleForm.dayOfWeek.length === 0 && (
                <p className="text-red-500 text-sm">يرجى اختيار يوم واحد على الأقل</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت البداية
            </label>
            <input
              type="time"
              value={scheduleForm.startTime}
              onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت النهاية
            </label>
            <input
              type="time"
              value={scheduleForm.endTime}
              onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم القاعة
            </label>
            <input
              type="text"
              value={scheduleForm.room}
              onChange={(e) => setScheduleForm({...scheduleForm, room: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="مثال: قاعة 1، مختبر A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ البداية
            </label>
            <input
              type="date"
              value={scheduleForm.startDate}
              onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {scheduleForm.scheduleType === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ النهاية
              </label>
              <input
                type="date"
                value={scheduleForm.endDate}
                onChange={(e) => setScheduleForm({...scheduleForm, endDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          )}
        </div>

        {/* عرض عدد الطلاب المتوقعين */}
        {scheduleForm.subjectId && scheduleForm.teacherId && (
          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">الطلاب المتوقعون للحضور:</h4>
            <div className="space-y-1">
              {getExpectedStudents(scheduleForm.subjectId, scheduleForm.teacherId).map(student => (
                <div key={student.id} className="text-blue-700 text-sm">
                  • {student.name} - {student.grade} - {student.phone}
                </div>
              ))}
              <div className="font-semibold text-blue-800 mt-2">
                العدد الإجمالي: {getExpectedStudents(scheduleForm.subjectId, scheduleForm.teacherId).length} طالب
              </div>
            </div>
          </div>
        )}


        
        <button
          type="submit"
          className="w-full bg-primary from-orange-600 to-orange-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105"
        >
          إضافة الموعد
        </button>
      </form>
    </div>
  );

  const renderStudentsTable = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          قائمة الطلاب
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في الطلاب..."
            value={studentsFilter}
            onChange={(e) => setStudentsFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Advanced Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          تصفية متقدمة
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* المرحلة التعليمية */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">المرحلة التعليمية</label>
            <select
              value={educationLevelFilter}
              onChange={(e) => {
                setEducationLevelFilter(e.target.value as 'all' | 'preparatory' | 'secondary');
                setGradeFilter('all'); // Reset grade filter when level changes
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المراحل</option>
              <option value="preparatory">إعدادي</option>
              <option value="secondary">ثانوي</option>
            </select>
          </div>
          
          {/* الصف */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الصف</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الصفوف</option>
              {educationLevelFilter === 'preparatory' && (
                <>
                  <option value="الأولى الإعدادي">الأولى الإعدادي</option>
                  <option value="الثانية الإعدادي">الثانية الإعدادي</option>
                  <option value="الثالثة الإعدادي">الثالثة الإعدادي</option>
                </>
              )}
              {educationLevelFilter === 'secondary' && (
                <>
                  <option value="الأولى الثانوي">الأولى الثانوي</option>
                  <option value="الثانية الثانوي">الثانية الثانوي</option>
                  <option value="الثالثة الثانوي">الثالثة الثانوي</option>
                </>
              )}
              {educationLevelFilter === 'all' && (
                <>
                  <option value="الأولى الإعدادي">الأولى الإعدادي</option>
                  <option value="الثانية الإعدادي">الثانية الإعدادي</option>
                  <option value="الثالثة الإعدادي">الثالثة الإعدادي</option>
                  <option value="الأولى الثانوي">الأولى الثانوي</option>
                  <option value="الثانية الثانوي">الثانية الثانوي</option>
                  <option value="الثالثة الثانوي">الثالثة الثانوي</option>
                </>
              )}
            </select>
          </div>
          
          {/* حالة الدفع */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">حالة الدفع</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الطلاب</option>
              <option value="paid">مدفوع</option>
              <option value="unpaid">غير مدفوع</option>
            </select>
          </div>
          
          {/* النوع */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">النوع</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as 'all' | 'male' | 'female')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الطلاب</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          
          {/* زر إعادة تعيين التصفية */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setStudentsFilter('');
                setEducationLevelFilter('all');
                setGradeFilter('all');
                setPaymentFilter('all');
                setGenderFilter('all');
              }}
              className="w-full px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
        
        {/* إحصائيات التصفية */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              النتائج: <span className="font-semibold text-blue-600">{getFilteredStudents().length}</span> طالب
              {getFilteredStudents().length > studentsPerPage && (
                <span className="text-gray-500 mr-2">
                  (عرض {studentsPerPage} في كل صفحة)
                </span>
              )}
            </span>
            <span>
              إجمالي الطلاب: <span className="font-semibold text-gray-800">{students.length}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>اسم المستخدم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>العمر</TableHead>
              <TableHead>المرحلة</TableHead>
              <TableHead>الصف</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>هاتف ولي الأمر</TableHead>
              <TableHead>المواد</TableHead>
              <TableHead>الرسوم</TableHead>
              <TableHead>النقاط</TableHead>
              <TableHead>الشهادات</TableHead>
              <TableHead>حالة الدفع</TableHead>
              <TableHead>فترة الدفع</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedStudents().length > 0 ? (
              getPaginatedStudents().map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkMyMi43NjE0IDI2IDI1IDIzLjc2MTQgMjUgMjFDMjUgMTguMjM4NiAyMi43NjE0IDE2IDIwIDE2QzE3LjIzODYgMTYgMTUgMTguMjM4NiAxNSAyMUMxNSAyMy43NjE0IDE3LjIzODYgMjYgMjAgMjZaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDE0IDI1LjMxMzcgMTQgMjJIMjZDMjYgMjUuMzEzNyAyMy4zMTM3IDI4IDIwIDI4WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.username}</TableCell>
                <TableCell>{student.gender === 'male' ? 'ذكر' : 'أنثى'}</TableCell>
                <TableCell>{student.age}</TableCell>
                <TableCell>{student.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.parentPhone}</TableCell>
                <TableCell>
                  {student.selectedSubjects.map(subjectId => {
                    const subject = subjects.find(s => s.id === subjectId);
                    return subject?.name || 'غير محدد';
                  }).join(', ')}
                </TableCell>
                <TableCell>{student.totalPrice} جنيه</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="font-semibold text-gray-800">{student.points !== undefined ? student.points : 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {student.certificates && Array.isArray(student.certificates) && student.certificates.length > 0 ? (
                      <>
                        <div className="flex -space-x-2">
                          {student.certificates.slice(0, 3).map((certificate, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-primary from-purple-100 to-pink-100 cursor-pointer hover:scale-110 transition-transform duration-200"
                              title={`شهادة ${index + 1}`}
                              onClick={() => window.open(certificate, '_blank')}
                            >
                              <img
                                src={certificate}
                                alt={`شهادة ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMkMxOC4yMDkxIDIyIDIwIDIwLjIwOTEgMjAgMThDMjAgMTUuNzkwOSAxOC4yMDkxIDE0IDE2IDE0QzEzLjc5MDkgMTQgMTIgMTUuNzkwOSAxMiAxOEMxMiAyMC4yMDkxIDEzLjc5MDkgMjIgMTYgMjJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNiAyNEMxMy43OTA5IDI0IDEyIDIxLjIwOTEgMTIgMThIMjBDMjAgMjEuMjA5MSAxOC4yMDkxIDI0IDE2IDI0WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        {student.certificates.length > 3 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            +{student.certificates.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">لا توجد شهادات</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    student.hasPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.hasPaid ? 'مدفوع' : 'غير مدفوع'}
                  </span>
                </TableCell>
                <TableCell>
                  {student.monthStartDate && student.monthEndDate ? (
                    <div className="text-xs space-y-1">
                      <div className="text-gray-600">
                        من: {new Date(student.monthStartDate).toLocaleDateString('ar-EG')}
                      </div>
                      <div className="text-gray-600">
                        إلى: {new Date(student.monthEndDate).toLocaleDateString('ar-EG')}
                      </div>
                      {(() => {
                        const today = new Date();
                        const endDate = new Date(student.monthEndDate);
                        const isExpired = today > endDate;
                        return (
                          <div className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                            {isExpired ? 'انتهت' : 'نشطة'}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">غير محدد</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit('student', student.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const newPoints = prompt(`أدخل النقاط الجديدة للطالب ${student.name}:`, (student.points !== undefined ? student.points : 0).toString());
                        if (newPoints !== null) {
                          const points = parseInt(newPoints) || 0;
                          updateStudent(student.id, { ...student, points }).then(() => {
                            // Refresh students list
                            getStudents().then(setStudents);
                            toast.success('تم تحديث النقاط بنجاح!');
                          }).catch(() => {
                            toast.error('حدث خطأ في تحديث النقاط');
                          });
                        }
                      }}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors hover:scale-110 transform"
                      title="تعديل النقاط"
                    >
                      <span className="text-lg animate-pulse">⭐</span>
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            ) : (
              <TableRow>
                <TableCell colSpan={16} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
                    <p className="text-gray-500">لا يوجد طلاب يطابقون معايير البحث المحددة</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* نظام ترقيم الصفحات */}
      {getFilteredStudents().length > studentsPerPage && (
        <div className="mt-6 flex flex-col items-center">
          {/* معلومات الصفحة */}
          <div className="text-center mb-4">
            <p className="text-gray-600 text-sm">
              عرض {((currentPage - 1) * studentsPerPage) + 1} إلى {Math.min(currentPage * studentsPerPage, getFilteredStudents().length)} من أصل {getFilteredStudents().length} طالب
            </p>
          </div>
          
          {/* أزرار التنقل */}
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            {/* زر الصفحة السابقة */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
              }`}
              aria-label="الصفحة السابقة"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* أرقام الصفحات */}
            <div className="flex items-center space-x-1 space-x-reverse">
              {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => {
                // عرض أرقام الصفحات مع إظهار "..." للصفحات الكثيرة
                if (getTotalPages() <= 7) {
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else {
                  // عرض أرقام الصفحات مع "..." للصفحات الكثيرة
                  if (page === 1 || page === getTotalPages() || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              })}
            </div>
            
            {/* زر الصفحة التالية */}
            <button
              onClick={nextPage}
              disabled={currentPage === getTotalPages()}
              className={`p-2 rounded-lg transition-all duration-300 ${
                currentPage === getTotalPages()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
              }`}
              aria-label="الصفحة التالية"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTeachersTable = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <UserCog className="w-5 h-5 mr-2 text-green-600" />
          قائمة المدرسين
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المدرسين..."
            value={teachersFilter}
            onChange={(e) => setTeachersFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      {/* Advanced Filters for Teachers */}
      <div className="bg-green-50 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          تصفية متقدمة للمدرسين
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* المرحلة التعليمية */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">المرحلة التعليمية</label>
            <select
              value={teacherEducationLevelFilter}
              onChange={(e) => {
                setTeacherEducationLevelFilter(e.target.value as 'all' | 'preparatory' | 'secondary');
                setTeacherGradeFilter('all'); // Reset grade filter when level changes
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">جميع المراحل</option>
              <option value="preparatory">إعدادي</option>
              <option value="secondary">ثانوي</option>
            </select>
          </div>
          
          {/* الصف */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الصف</label>
            <select
              value={teacherGradeFilter}
              onChange={(e) => setTeacherGradeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">جميع الصفوف</option>
              {teacherEducationLevelFilter === 'preparatory' && (
                <>
                  <option value="الأولى الإعدادي">الأولى الإعدادي</option>
                  <option value="الثانية الإعدادي">الثانية الإعدادي</option>
                  <option value="الثالثة الإعدادي">الثالثة الإعدادي</option>
                </>
              )}
              {teacherEducationLevelFilter === 'secondary' && (
                <>
                  <option value="الأولى الثانوي">الأولى الثانوي</option>
                  <option value="الثانية الثانوي">الثانية الثانوي</option>
                  <option value="الثالثة الثانوي">الثالثة الثانوي</option>
                </>
              )}
              {teacherEducationLevelFilter === 'all' && (
                <>
                  <option value="الأولى الإعدادي">الأولى الإعدادي</option>
                  <option value="الثانية الإعدادي">الثانية الإعدادي</option>
                  <option value="الثالثة الإعدادي">الثالثة الإعدادي</option>
                  <option value="الأولى الثانوي">الأولى الثانوي</option>
                  <option value="الثانية الثانوي">الثانية الثانوي</option>
                  <option value="الثالثة الثانوي">الثالثة الثانوي</option>
                </>
              )}
            </select>
          </div>
          
          {/* المادة الدراسية */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">المادة الدراسية</label>
            <select
              value={teacherSubjectFilter}
              onChange={(e) => setTeacherSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">جميع المواد</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* زر إعادة تعيين */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setTeachersFilter('');
                setTeacherEducationLevelFilter('all');
                setTeacherGradeFilter('all');
                setTeacherSubjectFilter('all');
              }}
              className="w-full px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
        
        {/* إحصائيات التصفية */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              النتائج: <span className="font-semibold text-green-600">{getFilteredTeachers().length}</span> مدرس
            </span>
            <span>
              إجمالي المدرسين: <span className="font-semibold text-gray-800">{teachers.length}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>المادة</TableHead>
              <TableHead>المرحلة والصف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedTeachers().length > 0 ? (
              getPaginatedTeachers().map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {teacher.photo ? (
                      <img
                        src={teacher.photo}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkMyMi43NjE0IDI2IDI1IDIzLjc2MTQgMjUgMjFDMjUgMTguMjM4NiAyMi43NjE0IDE2IDIwIDE2QzE3LjIzODYgMTYgMTUgMTguMjM4NiAxNSAyMUMxNSAyMy43NjE0IDE3LjIzODYgMjYgMjAgMjZaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDE0IDI1LjMxMzcgMTQgMjJIMjZDMjYgMjUuMzEzNyAyMy4zMTM3IDI4IDIwIDI4WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.phone}</TableCell>
                <TableCell>
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    (() => {
                      const subject = subjects.find(s => s.id === teacher.subjects[0]);
                      return subject ? (
                        <div className="font-medium text-gray-800">
                          {subject.name}
                        </div>
                      ) : (
                        <span className="text-gray-500">غير محدد</span>
                      );
                    })()
                  ) : (
                    <span className="text-gray-500">غير محدد</span>
                  )}
                </TableCell>
                <TableCell>
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    (() => {
                      const subject = subjects.find(s => s.id === teacher.subjects[0]);
                      if (subject) {
                        const subjectInfo = getSubjectInfo(subject.id);
                        return (
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                {subjectInfo.educationLevel}
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                                {subjectInfo.grade}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return <span className="text-gray-500">غير محدد</span>;
                    })()
                  ) : (
                    <span className="text-gray-500">غير محدد</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit('teacher', teacher.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <UserCog className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
                    <p className="text-gray-500">لا يوجد مدرسين يطابقون معايير البحث المحددة</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* نظام ترقيم الصفحات للمدرسين */}
      {renderPagination(
        currentTeachersPage,
        getTotalTeachersPages(),
        nextTeachersPage,
        prevTeachersPage,
        goToTeachersPage,
        getFilteredTeachers().length,
        teachersPerPage,
        'مدرس'
      )}
    </div>
  );

  const renderSubjectsTable = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
          قائمة المواد
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المواد..."
            value={subjectsFilter}
            onChange={(e) => setSubjectsFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المادة</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المدة</TableHead>
              <TableHead>المرحلة</TableHead>
              <TableHead>الصفوف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedSubjects().length > 0 ? (
              getPaginatedSubjects().map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.description}</TableCell>
                <TableCell>{subject.price} جنيه</TableCell>
                <TableCell>{subject.duration}</TableCell>
                <TableCell>{subject.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'}</TableCell>
                <TableCell>{subject.grade.join(', ')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit('subject', subject.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
                    <p className="text-gray-500">لا توجد مواد تطابق معايير البحث المحددة</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* نظام ترقيم الصفحات للمواد */}
      {renderPagination(
        currentSubjectsPage,
        getTotalSubjectsPages(),
        nextSubjectsPage,
        prevSubjectsPage,
        goToSubjectsPage,
        getFilteredSubjects().length,
        subjectsPerPage,
        'مادة'
      )}
    </div>
  );

  // دالة لتحويل الوقت من 24 ساعة إلى 12 ساعة
  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // دالة لتحويل أيام الأسبوع إلى العربية
  const getDayInArabic = (day: string | string[]) => {
    const daysMap: { [key: string]: string } = {
      'sunday': 'الأحد',
      'monday': 'الاثنين',
      'tuesday': 'الثلاثاء',
      'wednesday': 'الأربعاء',
      'thursday': 'الخميس',
      'friday': 'الجمعة',
      'saturday': 'السبت'
    };
    
    if (Array.isArray(day)) {
      return day.map(d => daysMap[d.toLowerCase()] || d).join('، ');
    }
    return daysMap[day.toLowerCase()] || day;
  };

  // دالة للحصول على معلومات الصف والمرحلة الدراسية للمادة
  const getSubjectInfo = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return { educationLevel: 'غير محدد', grade: 'غير محدد' };
    
    const educationLevelText = subject.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي';
    const gradeText = Array.isArray(subject.grade) ? subject.grade.join(', ') : subject.grade;
    
    return {
      educationLevel: educationLevelText,
      grade: gradeText
    };
  };

  // دالة للحصول على معلومات كاملة للمادة مع الصف والمرحلة
  const getFullSubjectInfo = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 'مادة غير محددة';
    
    const educationLevelText = subject.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي';
    const gradeText = Array.isArray(subject.grade) ? subject.grade.join(', ') : subject.grade;
    
    return `${subject.name} - ${gradeText} - ${educationLevelText}`;
  };

  const renderMessagesTable = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-red-600" />
          قائمة الرسائل
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في الرسائل..."
            value={messagesFilter}
            onChange={(e) => setMessagesFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>المحتوى</TableHead>
            <TableHead>المستهدفون</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getPaginatedMessages().length > 0 ? (
            getPaginatedMessages().map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">{message.title}</TableCell>
              <TableCell>
                <div className="max-w-xs truncate" title={message.content}>
                  {message.content}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {getTargetTypeLabel(message.targetType)}
                  {message.targetValue && (
                    <span className="text-xs text-gray-500 block">
                      {message.targetValue}
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(message.priority)}`}>
                  {getPriorityLabel(message.priority)}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  message.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message.isActive ? 'مفعلة' : 'معطلة'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {new Date(message.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEditMessage(message)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500">لا توجد رسائل تطابق معايير البحث المحددة</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* نظام ترقيم الصفحات للرسائل */}
      {renderPagination(
        currentMessagesPage,
        getTotalMessagesPages(),
        nextMessagesPage,
        prevMessagesPage,
        goToMessagesPage,
        messages.filter(message => 
          message.title.toLowerCase().includes(messagesFilter.toLowerCase()) ||
          message.content.toLowerCase().includes(messagesFilter.toLowerCase())
        ).length,
        messagesPerPage,
        'رسالة'
      )}
    </div>
  );

  const renderSchedulesTable = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          جدول المواعيد
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المواعيد..."
            value={schedulesFilter}
            onChange={(e) => setSchedulesFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={async () => {
              if (confirm('هل أنت متأكد من حذف جميع المواعيد المنتهية؟')) {
                try {
                  const result = await cleanupExpiredSchedules();
                  if (result.removedCount > 0) {
                    toast.success(`تم حذف ${result.removedCount} موعد منتهي بنجاح`);
                    const updatedSchedules = await getSchedules();
                    setSchedules(updatedSchedules);
                  } else {
                    toast.info('لا توجد مواعيد منتهية للحذف');
                  }
                } catch (error) {
                  toast.error('حدث خطأ أثناء حذف المواعيد المنتهية');
                }
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            حذف المواعيد المنتهية
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المادة</TableHead>
              <TableHead>المرحلة الدراسية</TableHead>
              <TableHead>الصف</TableHead>
              <TableHead>المدرس</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>اليوم</TableHead>
              <TableHead>الوقت</TableHead>
              <TableHead>القاعة</TableHead>
              <TableHead>تاريخ البداية</TableHead>
              <TableHead>تاريخ النهاية</TableHead>
              <TableHead>عدد الحلقات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>عدد الطلاب المتوقعين</TableHead>
              <TableHead>الحضور والغياب</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedSchedules().length > 0 ? (
              getPaginatedSchedules().map((schedule) => {
              const subjectInfo = getSubjectInfo(schedule.subjectId);
              const expectedStudentsCount = getExpectedStudents(schedule.subjectId, schedule.teacherId).length;
              const presentCount = Object.values(attendanceData[schedule.id] || {}).filter(Boolean).length;
              const absentCount = expectedStudentsCount - presentCount;
              
              return (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {subjects.find(s => s.id === schedule.subjectId)?.name || 'غير محدد'}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {subjectInfo.educationLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                      {subjectInfo.grade}
                    </span>
                  </TableCell>
                  <TableCell>
                    {teachers.find(t => t.id === schedule.teacherId)?.name || 'غير محدد'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      schedule.scheduleType === 'weekly' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.scheduleType === 'weekly' ? 'أسبوعي' : 'منفرد'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getDayInArabic(schedule.dayOfWeek)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.room}</TableCell>
                  <TableCell>{schedule.startDate}</TableCell>
                  <TableCell>{schedule.endDate || '-'}</TableCell>
                  <TableCell>
                    {schedule.scheduleType === 'weekly' && schedule.endDate 
                      ? `${calculateWeeklySessions(schedule.startDate, schedule.endDate)} حلقة`
                      : schedule.scheduleType === 'single' ? '1 حلقة' : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isScheduleExpired(schedule) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {isScheduleExpired(schedule) ? 'منتهي' : 'نشط'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {expectedStudentsCount}
                      </div>
                      <div className="text-xs text-gray-500">طالب</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAttendanceModal(schedule.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        إدارة الحضور
                      </button>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-green-600">حضور:</span>
                          <span className="font-medium">{presentCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">غياب:</span>
                          <span className="font-medium">{absentCount}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit('schedule', schedule.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
                    <p className="text-gray-500">لا توجد مواعيد تطابق معايير البحث المحددة</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* نظام ترقيم الصفحات للمواعيد */}
      {renderPagination(
        currentSchedulesPage,
        getTotalSchedulesPages(),
        nextSchedulesPage,
        prevSchedulesPage,
        goToSchedulesPage,
        getFilteredSchedules().length,
        schedulesPerPage,
        'موعد'
      )}
    </div>
  );

  const renderStatsCards = () => {
    const studentBreakdown = getStudentBreakdown();
    
    return (
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div 
          className="bg-primary from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setStudentsDetailModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-blue-100">إجمالي الطلاب</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
          <div className="text-sm text-blue-100">
            <div className="flex justify-between">
              <span>إعدادي: {studentBreakdown.preparatory}</span>
              <span>ثانوي: {studentBreakdown.secondary}</span>
            </div>
          </div>
          <p className="text-sm text-blue-100 mt-2">اضغط لعرض التفاصيل</p>
        </div>
        
        <div 
          className="bg-primary from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setTeachersDetailModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">إجمالي المدرسين</p>
              <p className="text-3xl font-bold">{teachers.length}</p>
            </div>
            <UserCog className="w-12 h-12 text-green-200" />
          </div>
          <p className="text-sm text-green-100 mt-2">اضغط لعرض التفاصيل</p>
        </div>
        
        <div 
          className="bg-primary from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setSubjectsDetailModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">إجمالي المواد</p>
              <p className="text-3xl font-bold">{subjects.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-purple-200" />
          </div>
          <p className="text-sm text-purple-100 mt-2">اضغط لعرض التفاصيل</p>
        </div>
        
        <div 
          className="bg-primary from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setCalendarModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">إجمالي المواعيد</p>
              <p className="text-3xl font-bold">{schedules.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-orange-200" />
          </div>
          <p className="text-sm text-orange-100 mt-2">اضغط لعرض التقويم</p>
        </div>
        
        <div 
          className="bg-primary from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setMessagesDetailModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">إجمالي الرسائل</p>
              <p className="text-3xl font-bold">{messages.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-red-200" />
          </div>
          <div className="text-sm text-red-100 mt-2">
            <div className="flex justify-between">
              <span>مفعلة: {messages.filter(m => m.isActive).length}</span>
              <span>عالية: {messages.filter(m => m.priority === 'high').length}</span>
            </div>
          </div>
          <p className="text-sm text-red-100 mt-2">اضغط لعرض التفاصيل</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-primary from-blue-50 via-white to-green-50">
      <Navbar />
      
      <div className="pt-8 pb-16 px-4">
        <div className="max-w-[1920px] mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              لوحة تحكم الإدارة
            </h1>
            <p className="text-xl text-gray-600">
              إدارة الطلاب والمدرسين والمواد الدراسية
            </p>
          </div>

          {renderStatsCards()}

          {/* Tabs */}
          <div className="flex space-x-1 space-x-reverse bg-gray-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'students'
                  ? 'bg-white shadow-md text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              إدارة الطلاب
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'teachers'
                  ? 'bg-white shadow-md text-green-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserCog className="w-4 h-4 mr-2" />
              إدارة المدرسين
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'subjects'
                  ? 'bg-white shadow-md text-purple-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              إدارة المواد
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'schedules'
                  ? 'bg-white shadow-md text-orange-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              إدارة المواعيد
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'messages'
                  ? 'bg-white shadow-md text-red-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              إدارة الرسائل
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'students' && (
            <>
              {renderStudentForm()}
              {renderStudentsTable()}
            </>
          )}
          {activeTab === 'teachers' && (
            <>
              {renderTeacherForm()}
              {renderTeachersTable()}
            </>
          )}
          {activeTab === 'subjects' && (
            <>
              {renderSubjectForm()}
              {renderSubjectsTable()}
            </>
          )}
          {activeTab === 'schedules' && (
            <>
              {renderScheduleForm()}
              {renderSchedulesTable()}
            </>
          )}
          {activeTab === 'messages' && (
            <>
              {renderMessageForm()}
              {renderMessagesTable()}
            </>
          )}

          {/* Calendar Modal */}
          <Modal
            isOpen={calendarModalOpen}
            onClose={() => setCalendarModalOpen(false)}
            title="تقويم المواعيد الأسبوعي"
            className="max-w-6xl"
          >
            <div className="rtl" dir="rtl">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,timeGridDay'
                }}
                events={schedules.flatMap(schedule => {
                  const subject = subjects.find(s => s.id === schedule.subjectId);
                  const teacher = teachers.find(t => t.id === schedule.teacherId);
                  const isExpired = isScheduleExpired(schedule);
                  

                  
                  // تحويل أسماء الأيام إلى أرقام
                  const dayMap = {
                    'sunday': 0,
                    'monday': 1,
                    'tuesday': 2,
                    'wednesday': 3,
                    'thursday': 4,
                    'friday': 5,
                    'saturday': 6,
                    'الأحد': 0,
                    'الاثنين': 1,
                    'الثلاثاء': 2,
                    'الأربعاء': 3,
                    'الخميس': 4,
                    'الجمعة': 5,
                    'السبت': 6
                  };
                  

                  
                  // التعامل مع dayOfWeek كـ string أو array
                  const days = Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek : [schedule.dayOfWeek];
                  
                  // تحويل الأيام إلى أرقام
                  const dayNumbers = days.map(day => dayMap[day]).filter(dayNumber => dayNumber !== undefined);
                  
                  if (dayNumbers.length === 0) {
                    return [];
                  }
                  

                  
                  // للمواعيد المنفردة، إنشاء حدث واحد فقط في التاريخ المحدد
                  if (schedule.scheduleType === 'single') {
                    const scheduleDate = new Date(schedule.startDate);
                    const today = new Date();
                    
                    // إذا كان الموعد منتهي الصلاحية، لا نعرضه في التقويم
                    if (scheduleDate < today) {
                      return null;
                    }
                    
                    return {
                      id: schedule.id,
                      title: `${subject?.name || 'مادة غير محددة'}\n${teacher?.name || 'مدرس غير محدد'}\nالقاعة: ${schedule.room}`,
                      start: `${schedule.startDate}T${schedule.startTime}`,
                      end: `${schedule.startDate}T${schedule.endTime}`,
                      backgroundColor: '#10b981',
                      borderColor: '#059669',
                      textColor: '#ffffff',
                      extendedProps: {
                        subject: subject?.name,
                        teacher: teacher?.name,
                        room: schedule.room,
                        type: schedule.scheduleType,
                        expired: false
                      }
                    };
                  }
                  
                  // للمواعيد الأسبوعية، إنشاء أحداث متكررة مع التحقق من الصلاحية
                  const startDate = new Date(schedule.startDate);
                  const endDate = schedule.endDate ? new Date(schedule.endDate) : null;
                  const today = new Date();
                  
                  // إذا كان الموعد منتهي الصلاحية، لا نعرضه في التقويم
                  if (isExpired) {

                    return [];
                  }
                  
                  const backgroundColor = schedule.scheduleType === 'weekly' ? '#10b981' : '#f59e0b';
                  const borderColor = schedule.scheduleType === 'weekly' ? '#059669' : '#d97706';
                  

                  
                  // إنشاء حدث منفصل لكل يوم
                  return dayNumbers.map((dayNumber, index) => {

                    return {
                      id: `${schedule.id}-${index}`,
                      title: `${subject?.name || 'مادة غير محددة'}\n${teacher?.name || 'مدرس غير محدد'}\nالقاعة: ${schedule.room}`,
                      daysOfWeek: [dayNumber],
                      startTime: schedule.startTime,
                      endTime: schedule.endTime,
                      startRecur: startDate.toISOString().split('T')[0],
                      endRecur: endDate ? endDate.toISOString().split('T')[0] : undefined,
                      backgroundColor: backgroundColor,
                      borderColor: borderColor,
                      textColor: '#ffffff',
                      extendedProps: {
                        subject: subject?.name,
                        teacher: teacher?.name,
                        room: schedule.room,
                        type: schedule.scheduleType,
                        expired: isExpired,
                        originalScheduleId: schedule.id,
                        dayOfWeek: dayNumber
                      }
                    };
                  });
                }).flat().filter(Boolean)}
                locale="ar"
                direction="rtl"
                height="600px"
                slotMinTime="08:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                weekends={true}
                dayHeaderFormat={{ weekday: 'long', day: 'numeric' }}
                eventDisplay="block"
                dayHeaderContent={(arg) => {
                  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                  return dayNames[arg.date.getDay()] + ' ' + arg.date.getDate();
                }}
                eventDidMount={(info) => {
                  // تحسين عرض النص في الأحداث
                  info.el.style.fontSize = '12px';
                  info.el.style.padding = '2px 4px';
                  info.el.style.borderRadius = '4px';
                  info.el.style.fontWeight = 'bold';
                  
                  // تطبيق الألوان المخصصة بقوة
                  const type = info.event.extendedProps.type;
                  
                  if (type === 'weekly') {
                    // مواعيد أسبوعية - أخضر
                    info.el.style.backgroundColor = '#10b981';
                    info.el.style.borderColor = '#059669';
                  } else {
                    // مواعيد منفردة - برتقالي
                    info.el.style.backgroundColor = '#f59e0b';
                    info.el.style.borderColor = '#d97706';
                  }
                  
                  info.el.style.borderWidth = '2px';
                  info.el.style.borderStyle = 'solid';
                  info.el.style.color = '#ffffff';
                  

                  
                  // إضافة tooltip للمعلومات الإضافية
                  const typeText = type === 'weekly' ? 'أسبوعي' : 'منفرد';
                  info.el.title = `المادة: ${info.event.extendedProps.subject}\nالمدرس: ${info.event.extendedProps.teacher}\nالقاعة: ${info.event.extendedProps.room}\nالنوع: ${typeText}`;
                }}
              />
            </div>
            
            {/* مفتاح الألوان */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm">مواعيد أسبوعية</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
                <span className="text-sm">مواعيد منفردة</span>
              </div>
            </div>
          </Modal>

          {/* Attendance Modal */}
          <Modal
            isOpen={attendanceModalOpen}
            onClose={() => setAttendanceModalOpen(false)}
            title="إدارة الحضور والغياب"
            className="max-w-[1600px] mx-auto"
          >
            {selectedScheduleForAttendance && (() => {
              const schedule = schedules.find(s => s.id === selectedScheduleForAttendance);
              const expectedStudents = getExpectedStudents(schedule?.subjectId || '', schedule?.teacherId || '');
              const presentStudents = expectedStudents.filter(student => attendanceData[selectedScheduleForAttendance]?.[student.id]);
              const absentStudents = expectedStudents.filter(student => !attendanceData[selectedScheduleForAttendance]?.[student.id]);
              const subjectInfo = getSubjectInfo(schedule?.subjectId || '');
              
              return (
                <div className="space-y-6 ">
                  {/* Schedule Info */}
                  <div className="bg-primary from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center">
                          <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                          {subjects.find(s => s.id === schedule?.subjectId)?.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <User className="w-4 h-4 mr-2 text-green-600" />
                            <span className="font-medium">المدرس:</span>
                            <span className="mr-2">{teachers.find(t => t.id === schedule?.teacherId)?.name}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <GraduationCap className="w-4 h-4 mr-2 text-purple-600" />
                            <span className="font-medium">الصف:</span>
                            <span className="mr-2">{subjectInfo.grade}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <School className="w-4 h-4 mr-2 text-indigo-600" />
                            <span className="font-medium">المرحلة:</span>
                            <span className="mr-2">{subjectInfo.educationLevel}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-medium">اليوم:</span>
                            <span className="mr-2 text-lg font-semibold text-orange-700">{getDayInArabic(schedule?.dayOfWeek || '')}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 mr-2 text-red-600" />
                            <span className="font-medium">الوقت:</span>
                            <span className="mr-2 text-lg font-semibold text-red-700">
                              {formatTime12Hour(schedule?.startTime || '')} - {formatTime12Hour(schedule?.endTime || '')}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium">القاعة:</span>
                            <span className="mr-2">{schedule?.room}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="grid lg:grid-cols-3 gap-6  ">
                    {/* Expected Students for Attendance */}
                    <div className="lg:col-span-2 max-h-full">
                      <h4 className="font-bold text-lg  text-gray-800 mb-4 flex items-center">
                        <Users className="w-6 h-6 mr-2 text-blue-600" />
                        الطلاب المتوقعون ({expectedStudents.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-full overflow-y-auto">
                        {expectedStudents.map(student => (
                          <div
                            key={student.id}
                            className={`border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                              attendanceData[selectedScheduleForAttendance]?.[student.id]
                                ? 'border-green-300 bg-green-50 shadow-green-100'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-gray-800 text-lg">{student.name}</h5>
                                <button
                                  onClick={() => updateAttendance(selectedScheduleForAttendance, student.id, !attendanceData[selectedScheduleForAttendance]?.[student.id])}
                                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                                    attendanceData[selectedScheduleForAttendance]?.[student.id]
                                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {attendanceData[selectedScheduleForAttendance]?.[student.id] ? '✅ حاضر' : '❌ غائب'}
                                </button>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  <span>الطالب: {student.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  <span>ولي الأمر: {student.parentPhone}</span>
                                </div>
                              </div>
                              {!attendanceData[selectedScheduleForAttendance]?.[student.id] && (
                                <div className="flex space-x-2 space-x-reverse pt-2 border-t border-gray-200">
                                  <button
                                    onClick={() => {
                                      const message = `مرحباً ${student.name}، نود تذكيرك بحضور حصة ${subjects.find(s => s.id === schedule?.subjectId)?.name} اليوم ${getDayInArabic(schedule?.dayOfWeek || '')} في تمام الساعة ${formatTime12Hour(schedule?.startTime || '')} - ${formatTime12Hour(schedule?.endTime || '')} في ${schedule?.room}. نرجو الحضور في الموعد المحدد.`;
                                      const whatsappUrl = `https://wa.me/${student.phone.replace(/^0/, '20')}?text=${encodeURIComponent(message)}`;
                                      window.open(whatsappUrl, '_blank');
                                    }}
                                    className="flex-1 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center justify-center"
                                    title="تواصل مع الطالب عبر الواتساب"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                    للطالب
                                  </button>
                                  <button
                                    onClick={() => {
                                      const subjectName = subjects.find(s => s.id === schedule?.subjectId)?.name || 'المادة';
                                      const dayName = getDayInArabic(schedule?.dayOfWeek || '');
                                      const date = new Date().toLocaleDateString('ar-EG');
                                      const time = `${formatTime12Hour(schedule?.startTime || '')} - ${formatTime12Hour(schedule?.endTime || '')}`;
                                      
                                      const message = `السلام عليكم ورحمة الله وبركاته

نود إعلامكم أن الطالب/ة ${student.name} قد تغيب/تغيبت عن حصة ${subjectName} اليوم ${dayName} الموافق ${date} في تمام الساعة ${time} في ${schedule?.room}.

نرجو التواصل معنا لمعرفة سبب الغياب ومتابعة المستوى الدراسي.

شكراً لكم
مركز الأكاديمي فولت`;
                                      
                                      const whatsappUrl = `https://wa.me/${student.parentPhone.replace(/^0/, '20')}?text=${encodeURIComponent(message)}`;
                                      window.open(whatsappUrl, '_blank');
                                    }}
                                    className="flex-1 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center justify-center"
                                    title="تواصل مع ولي الأمر عبر الواتساب"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                    لولي الأمر
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-6">
                      <h4 className="font-bold text-lg text-gray-800 mb-4">ملخص الحضور</h4>
                      
                      {/* Present Students */}
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <h5 className="font-bold text-green-700 mb-3 flex items-center text-lg">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          الطلاب الحاضرون ({presentStudents.length})
                        </h5>
                        <div className="space-y-2">
                          {presentStudents.length > 0 ? (
                            presentStudents.map(student => (
                              <div key={student.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-green-200">
                                <span className="text-sm font-medium text-green-800">• {student.name}</span>
                                <span className="text-xs text-green-600">✅ حاضر</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-green-600 text-center py-4">لا يوجد طلاب حاضرون</p>
                          )}
                        </div>
                      </div>

                      {/* Absent Students */}
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <h5 className="font-bold text-red-700 mb-3 flex items-center text-lg">
                          <X className="w-5 h-5 mr-2" />
                          الطلاب الغائبون ({absentStudents.length})
                        </h5>
                        <div className="space-y-2">
                          {absentStudents.length > 0 ? (
                            absentStudents.map(student => (
                              <div key={student.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-red-200">
                                <span className="text-sm font-medium text-red-800">• {student.name}</span>
                                <button
                                  onClick={() => window.open(`tel:${student.parentPhone}`, '_self')}
                                  className="text-blue-600 hover:text-blue-800 flex items-center text-xs"
                                  title="اتصال بولي الأمر"
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  اتصال
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-red-600 text-center py-4">جميع الطلاب حاضرون</p>
                          )}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <h5 className="font-bold text-blue-700 mb-3 flex items-center text-lg">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          إحصائيات الحضور
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">إجمالي الطلاب:</span>
                            <span className="font-bold text-blue-800">{expectedStudents.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700">الحضور:</span>
                            <span className="font-bold text-green-800">{presentStudents.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-red-700">الغياب:</span>
                            <span className="font-bold text-red-800">{absentStudents.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700">نسبة الحضور:</span>
                            <span className="font-bold text-purple-800">
                              {expectedStudents.length > 0 ? Math.round((presentStudents.length / expectedStudents.length) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Modal>

          {/* Edit Modal */}
          <Modal
            isOpen={editModalOpen}
            onClose={handleCloseModal}
            title={`تعديل ${
              editingType === 'student' ? 'الطالب' :
              editingType === 'teacher' ? 'المدرس' :
              editingType === 'subject' ? 'المادة' :
              'الموعد'
            }`}
          >
            {editingType === 'student' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الطالب
                    </label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      value={editData.username || ''}
                      onChange={(e) => setEditData({...editData, username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={editData.password || ''}
                      onChange={(e) => setEditData({...editData, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الطالب
                    </label>
                    <select
                      value={editData.gender || ''}
                      onChange={(e) => setEditData({...editData, gender: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الميلاد
                    </label>
                    <input
                      type="date"
                      value={editData.birthDate || ''}
                      onChange={(e) => setEditData({...editData, birthDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العمر
                    </label>
                    <input
                      type="number"
                      value={editData.age || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المرحلة التعليمية
                    </label>
                    <select
                      value={editData.educationLevel || ''}
                      onChange={(e) => setEditData({...editData, educationLevel: e.target.value, grade: ''})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">اختر المرحلة</option>
                      <option value="preparatory">إعدادي</option>
                      <option value="secondary">ثانوي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الصف الدراسي
                    </label>
                    <select
                      value={editData.grade || ''}
                      onChange={(e) => setEditData({...editData, grade: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">اختر الصف</option>
                      {getGradesForLevel(editData.educationLevel || 'secondary').map(grade => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم هاتف ولي الأمر
                    </label>
                    <input
                      type="tel"
                      value={editData.parentPhone || ''}
                      onChange={(e) => setEditData({...editData, parentPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الصورة
                    </label>
                    <input
                      type="url"
                      value={editData.photo || ''}
                      onChange={(e) => setEditData({...editData, photo: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
                    {/* معاينة الصورة */}
                    {editData.photo && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-2">معاينة الصورة:</label>
                        <div className="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={editData.photo}
                            alt="معاينة الصورة"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA1MkM1Mi40MTgzIDUyIDU2IDQ4LjQxODMgNTYgNDRDNTYgMzkuNTgxNyA1Mi40MTgzIDM2IDQ4IDM2QzQzLjU4MTcgMzYgNDAgMzkuNTgxNyA0MCA0NEM0MCA0OC40MTgzIDQzLjU4MTcgNTIgNDggNTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik00OCA1NkM0My41ODE3IDU2IDQwIDU5LjU4MTcgNDAgNjRINDhDNjAuOTI5IDY0IDgwIDU5LjU4MTcgODAgNTZDODAgNTIuNDE4MyA3Ni40MTgzIDQ5IDcyIDQ5SDQ4WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المواد المختارة
                  </label>
                  <MultiSelect
                    options={subjects.filter(s => 
                      s.educationLevel === editData.educationLevel && 
                      (Array.isArray(s.grade) ? s.grade.includes(editData.grade) : s.grade === editData.grade)
                    ).map(subject => ({
                      value: subject.id,
                      label: `${subject.name} - ${subject.price} جنيه`
                    }))}
                    value={editData.selectedSubjects || []}
                    onChange={(selectedSubjects) => setEditData({...editData, selectedSubjects})}
                    placeholder="اختر المواد..."
                  />
                  {editData.selectedSubjects && editData.selectedSubjects.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">تفاصيل المواد المختارة:</p>
                      <div className="space-y-1">
                        {editData.selectedSubjects.map(subjectId => {
                          const subject = subjects.find(s => s.id === subjectId);
                          return subject ? (
                            <div key={subjectId} className="text-sm text-blue-700">
                              • {subject.name}: {subject.price} جنيه
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      إجمالي الرسوم
                    </label>
                    <input
                      type="number"
                      value={editData.totalPrice || 0}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      يتم الحساب تلقائياً بناءً على المواد المختارة
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة الدفع
                    </label>
                    <select
                      value={editData.hasPaid ? 'true' : 'false'}
                      onChange={(e) => setEditData({...editData, hasPaid: e.target.value === 'true'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">غير مدفوع</option>
                      <option value="true">مدفوع</option>
                    </select>
                  </div>
                </div>

                {/* الحقول الجديدة */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      النقاط
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editData.points !== undefined ? editData.points : 0}
                        onChange={(e) => setEditData({...editData, points: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-2xl">⭐</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">النقاط التي حصل عليها الطالب من التفاعل والإنجازات</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الملاحظات
                    </label>
                    <textarea
                      value={editData.notes !== undefined ? editData.notes : ''}
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="ملاحظات حول الطالب..."
                    />
                    <p className="text-xs text-gray-500 mt-1">ملاحظات خاصة حول الطالب</p>
                  </div>
                </div>

                {/* الشهادات */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الشهادات
                  </label>
                  <div className="space-y-3">
                    {(editData.certificates && Array.isArray(editData.certificates) ? editData.certificates : []).map((certificate: string, index: number) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="url"
                            value={certificate}
                            onChange={(e) => {
                              const newCertificates = [...(editData.certificates || [])];
                              newCertificates[index] = e.target.value;
                              setEditData({...editData, certificates: newCertificates});
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="رابط صورة الشهادة..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newCertificates = (editData.certificates || []).filter((_, i) => i !== index);
                              setEditData({...editData, certificates: newCertificates});
                            }}
                            className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {/* معاينة الصورة */}
                        {certificate && certificate.trim() !== '' && (
                          <div className="bg-primary from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                            <h4 className="text-sm font-semibold text-purple-800 mb-3 text-center">معاينة الشهادة {index + 1}</h4>
                            <div className="aspect-video bg-white rounded-lg overflow-hidden shadow-sm border border-purple-100">
                              <img
                                src={certificate}
                                alt={`معاينة شهادة ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTcgMTIwIDExOSAxMTEuNDU3IDExOSAxMDFDMTE5IDkwLjU0MzEgMTEwLjQ1NyA4MiAxMDAgODJDODkuNTQzMSA4MiA4MSA5MC41NDMxIDgxIDEwMUM4MSAxMTEuNDU3IDg5LjU0MzEgMTIwIDEwMCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzg5LjU0MzEgMTMwIDgxIDEzNy41NDMgODEgMTQ4SDEyMEMxMjAgMTM3LjU0MyAxMTEuNDU3IDEzMCAxMDAgMTMwWiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                                }}
                              />
                            </div>
                            <div className="flex justify-center space-x-2 space-x-reverse mt-3">
                              <a
                                href={certificate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-600 hover:text-purple-800 transition-colors bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200 hover:scale-105 transform duration-200"
                              >
                                عرض الصورة
                              </a>
                              <button
                                type="button"
                                onClick={() => window.open(certificate, '_blank')}
                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 hover:scale-105 transform duration-200"
                              >
                                فتح في تبويب جديد
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditData({...editData, certificates: [...(editData.certificates && Array.isArray(editData.certificates) ? editData.certificates : []), '']})}
                      className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة شهادة جديدة
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">أضف روابط صور الشهادات التي حصل عليها الطالب</p>
                </div>

                {/* فترة الدفع الشهرية */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ بداية الشهر
                    </label>
                    <input
                      type="date"
                      value={editData.monthStartDate || ''}
                      onChange={(e) => {
                        const startDate = e.target.value;
                        const endDate = startDate ? (() => {
                          const start = new Date(startDate);
                          const end = new Date(start);
                          end.setMonth(end.getMonth() + 1);
                          end.setDate(start.getDate() - 1);
                          return end.toISOString().split('T')[0];
                        })() : '';
                        setEditData({...editData, monthStartDate: startDate, monthEndDate: endDate});
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">تاريخ بداية فترة الدفع الشهرية</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ نهاية الشهر
                    </label>
                    <input
                      type="date"
                      value={editData.monthEndDate || ''}
                      onChange={(e) => setEditData({...editData, monthEndDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">تاريخ نهاية فترة الدفع الشهرية</p>
                  </div>
                </div>

                {/* عرض حالة الدفع الحالية */}
                {editData.monthEndDate && (
                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-yellow-800 mb-2">معلومات فترة الدفع</h4>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <div>• تاريخ البداية: {editData.monthStartDate}</div>
                      <div>• تاريخ النهاية: {editData.monthEndDate}</div>
                      <div>• حالة الدفع: {editData.hasPaid ? 'مدفوع' : 'غير مدفوع'}</div>
                      {(() => {
                        const today = new Date();
                        const endDate = new Date(editData.monthEndDate);
                        const isExpired = today > endDate;
                        return (
                          <div className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                            • الحالة: {isExpired ? 'انتهت الفترة' : 'الفترة نشطة'}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </div>
            )}

            {editingType === 'teacher' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المدرس
                    </label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={editData.password || ''}
                      onChange={(e) => setEditData({...editData, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الصورة
                    </label>
                    <input
                      type="url"
                      value={editData.photo || ''}
                      onChange={(e) => setEditData({...editData, photo: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
                    {/* معاينة الصورة */}
                    {editData.photo && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-2">معاينة الصورة:</label>
                        <div className="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={editData.photo}
                            alt="معاينة الصورة"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA1MkM1Mi40MTgzIDUyIDU2IDQ4LjQxODMgNTYgNDRDNTYgMzkuNTgxNyA1Mi40MTgzIDM2IDQ4IDM2QzQzLjU4MTcgMzYgNDAgMzkuNTgxNyA0MCA0NEM0MCA0OC40MTgzIDQzLjU4MTcgNTIgNDggNTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik00OCA1NkM0My41ODE3IDU2IDQwIDU5LjU4MTcgNDAgNjRINDhDNjAuOTI5IDY0IDgwIDU5LjU4MTcgODAgNTZDODAgNTIuNDE4MyA3Ni40MTgzIDQ5IDcyIDQ5SDQ4WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المادة التي يدرسها
                  </label>
                  <select
                    value={Array.isArray(editData.subjects) ? editData.subjects[0] || '' : editData.subjects || ''}
                    onChange={(e) => setEditData({...editData, subjects: [e.target.value]})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map(subject => {
                      const subjectInfo = getSubjectInfo(subject.id);
                      return (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} - {subjectInfo.educationLevel} - {subjectInfo.grade}
                        </option>
                      );
                    })}
                  </select>
                  {editData.subjects && editData.subjects.length > 0 && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">تفاصيل المادة المختارة:</p>
                      {(() => {
                        const selectedSubject = subjects.find(s => s.id === editData.subjects[0]);
                        if (selectedSubject) {
                          const subjectInfo = getSubjectInfo(selectedSubject.id);
                          return (
                            <div className="text-sm text-green-700 space-y-1">
                              <div>• اسم المادة: {selectedSubject.name}</div>
                              <div>• المرحلة الدراسية: {subjectInfo.educationLevel}</div>
                              <div>• الصف: {subjectInfo.grade}</div>
                              <div>• السعر: {selectedSubject.price} جنيه</div>
                              <div>• المدة: {selectedSubject.duration}</div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </div>
            )}

            {editingType === 'subject' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المادة
                    </label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر
                    </label>
                    <input
                      type="number"
                      value={editData.price || ''}
                      onChange={(e) => setEditData({...editData, price: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدة
                    </label>
                    <input
                      type="text"
                      value={editData.duration || ''}
                      onChange={(e) => setEditData({...editData, duration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="مثال: شهر، فصل دراسي، سنة"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المرحلة التعليمية
                    </label>
                    <select
                      value={editData.educationLevel || ''}
                      onChange={(e) => setEditData({...editData, educationLevel: e.target.value, grade: ''})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">اختر المرحلة</option>
                      <option value="preparatory">إعدادي</option>
                      <option value="secondary">ثانوي</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصف المتاح
                  </label>
                  <select
                    value={Array.isArray(editData.grade) ? editData.grade[0] || '' : editData.grade || ''}
                    onChange={(e) => setEditData({...editData, grade: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر الصف</option>
                    {getGradesForLevel(editData.educationLevel || 'secondary').map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف المادة
                  </label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="وصف تفصيلي للمادة..."
                  />
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </div>
            )}

            {editingType === 'schedule' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الموعد
                    </label>
                    <select
                      value={editData.scheduleType || ''}
                      onChange={(e) => setEditData({...editData, scheduleType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="weekly">أسبوعي مستمر</option>
                      <option value="single">حصة منفردة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المادة والمدرس
                    </label>
                    <select
                      value={`${editData.subjectId || ''}-${editData.teacherId || ''}`}
                      onChange={(e) => {
                        const [subjectId, teacherId] = e.target.value.split('-');
                        setEditData({...editData, subjectId, teacherId});
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">اختر المادة والمدرس</option>
                      {subjects.map(subject => 
                        teachers
                          .filter(teacher => teacher.subjects.includes(subject.id))
                          .map(teacher => (
                            <option key={`${subject.id}-${teacher.id}`} value={`${subject.id}-${teacher.id}`}>
                              {subject.name} - {teacher.name} - {subject.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'} - {subject.grade.join(', ')}
                            </option>
                          ))
                      ).flat()}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      أيام الأسبوع
                    </label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'saturday', label: 'السبت' },
                          { value: 'sunday', label: 'الأحد' },
                          { value: 'monday', label: 'الاثنين' },
                          { value: 'tuesday', label: 'الثلاثاء' },
                          { value: 'wednesday', label: 'الأربعاء' },
                          { value: 'thursday', label: 'الخميس' },
                          { value: 'friday', label: 'الجمعة' }
                        ].map(day => (
                          <label key={day.value} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Array.isArray(editData.dayOfWeek) 
                                ? editData.dayOfWeek.includes(day.value)
                                : editData.dayOfWeek === day.value
                              }
                              onChange={(e) => {
                                const currentDays = Array.isArray(editData.dayOfWeek) 
                                  ? editData.dayOfWeek 
                                  : editData.dayOfWeek ? [editData.dayOfWeek] : [];
                                
                                if (e.target.checked) {
                                  setEditData({
                                    ...editData, 
                                    dayOfWeek: [...currentDays, day.value]
                                  });
                                } else {
                                  setEditData({
                                    ...editData, 
                                    dayOfWeek: currentDays.filter(d => d !== day.value)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{day.label}</span>
                          </label>
                        ))}
                      </div>
                      {Array.isArray(editData.dayOfWeek) && editData.dayOfWeek.length === 0 && (
                        <p className="text-red-500 text-sm">يرجى اختيار يوم واحد على الأقل</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وقت البداية
                    </label>
                    <input
                      type="time"
                      value={editData.startTime || ''}
                      onChange={(e) => setEditData({...editData, startTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وقت النهاية
                    </label>
                    <input
                      type="time"
                      value={editData.endTime || ''}
                      onChange={(e) => setEditData({...editData, endTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم القاعة
                    </label>
                    <input
                      type="text"
                      value={editData.room || ''}
                      onChange={(e) => setEditData({...editData, room: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="مثال: قاعة 1، مختبر A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ البداية
                    </label>
                    <input
                      type="date"
                      value={editData.startDate || ''}
                      onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {editData.scheduleType === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ النهاية
                      </label>
                      <input
                        type="date"
                        value={editData.endDate || ''}
                        onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* عرض عدد الطلاب المتوقعين */}
                {editData.subjectId && editData.teacherId && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-blue-800 mb-2">الطلاب المتوقعون للحضور:</h4>
                    <div className="space-y-1">
                      {getExpectedStudents(editData.subjectId, editData.teacherId).map(student => (
                        <div key={student.id} className="text-blue-700 text-sm">
                          • {student.name} - {student.grade} - {student.phone}
                        </div>
                      ))}
                      <div className="font-semibold text-blue-800 mt-2">
                        العدد الإجمالي: {getExpectedStudents(editData.subjectId, editData.teacherId).length} طالب
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>

        {/* Students Detail Modal */}
        <Modal
          isOpen={studentsDetailModalOpen}
          onClose={() => setStudentsDetailModalOpen(false)}
          title="تفاصيل الطلاب"
          className="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">إجمالي الطلاب</h3>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">الطلاب المدفوع لهم</h3>
                <p className="text-2xl font-bold text-green-600">{students.filter(s => s.hasPaid).length}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <h3 className="font-semibold text-orange-800 mb-2">الطلاب غير المدفوع لهم</h3>
                <p className="text-2xl font-bold text-orange-600">{students.filter(s => !s.hasPaid).length}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">التوزيع حسب المرحلة التعليمية</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800">إعدادي</span>
                    <span className="font-semibold text-blue-600">{students.filter(s => s.educationLevel === 'preparatory').length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800">ثانوي</span>
                    <span className="font-semibold text-green-600">{students.filter(s => s.educationLevel === 'secondary').length}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">التوزيع حسب الصف</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Array.from(new Set(students.map(s => s.grade))).map(grade => (
                    <div key={grade} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">{grade}</span>
                      <span className="font-semibold text-gray-600">{students.filter(s => s.grade === grade).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">قائمة الطلاب</h3>
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الصف</TableHead>
                      <TableHead>المرحلة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>عدد المواد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{student.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.hasPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {student.hasPaid ? 'مدفوع' : 'غير مدفوع'}
                          </span>
                        </TableCell>
                        <TableCell>{student.selectedSubjects.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Modal>

        {/* Teachers Detail Modal */}
        <Modal
          isOpen={teachersDetailModalOpen}
          onClose={() => setTeachersDetailModalOpen(false)}
          title="تفاصيل المدرسين"
          className="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">إجمالي المدرسين</h3>
                <p className="text-2xl font-bold text-green-600">{teachers.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">متوسط المواد لكل مدرس</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {(teachers.reduce((acc, teacher) => acc + teacher.subjects.length, 0) / teachers.length || 0).toFixed(1)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">قائمة المدرسين والمواد</h3>
              <div className="space-y-3">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{teacher.name}</h4>
                      <span className="text-sm text-gray-600">{teacher.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map(subjectId => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? (
                          <span key={subjectId} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {subject.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        {/* Subjects Detail Modal */}
        <Modal
          isOpen={subjectsDetailModalOpen}
          onClose={() => setSubjectsDetailModalOpen(false)}
          title="تفاصيل المواد"
          className="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-semibold text-purple-800 mb-2">إجمالي المواد</h3>
                <p className="text-2xl font-bold text-purple-600">{subjects.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">مواد إعدادي</h3>
                <p className="text-2xl font-bold text-blue-600">{subjects.filter(s => s.educationLevel === 'preparatory').length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">مواد ثانوي</h3>
                <p className="text-2xl font-bold text-green-600">{subjects.filter(s => s.educationLevel === 'secondary').length}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">التوزيع حسب المرحلة</h3>
                <div className="space-y-2">
                  {subjects.filter(s => s.educationLevel === 'preparatory').map(subject => (
                    <div key={subject.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800">{subject.name}</span>
                      <span className="font-semibold text-blue-600">{subject.price} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">التوزيع حسب المرحلة</h3>
                <div className="space-y-2">
                  {subjects.filter(s => s.educationLevel === 'secondary').map(subject => (
                    <div key={subject.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">{subject.name}</span>
                      <span className="font-semibold text-green-600">{subject.price} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">تفاصيل المواد</h3>
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المادة</TableHead>
                      <TableHead>المرحلة</TableHead>
                      <TableHead>الصفوف</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>المدة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map(subject => (
                      <TableRow key={subject.id}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'}</TableCell>
                        <TableCell>{subject.grade.join(', ')}</TableCell>
                        <TableCell>{subject.price} ج.م</TableCell>
                        <TableCell>{subject.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
                </Modal>

        {/* Message Modal */}
        <Modal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false);
            setEditingMessage(null);
            setMessageForm({
              title: '',
              content: '',
              targetType: 'all_students',
              targetValue: '',
              priority: 'medium',
              isActive: true
            });
          }}
          title={editingMessage ? 'تعديل الرسالة' : 'إضافة رسالة جديدة'}
          className="max-w-4xl"
        >
          <form onSubmit={editingMessage ? (e) => { e.preventDefault(); handleUpdateMessage(); } : handleAddMessage} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الرسالة
                </label>
                <input
                  type="text"
                  value={messageForm.title}
                  onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل عنوان الرسالة..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أولوية الرسالة
                </label>
                <select
                  value={messageForm.priority}
                  onChange={(e) => setMessageForm({...messageForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                محتوى الرسالة
              </label>
              <textarea
                value={messageForm.content}
                onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="أدخل محتوى الرسالة..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المستهدفين
                </label>
                <select
                  value={messageForm.targetType}
                  onChange={(e) => setMessageForm({...messageForm, targetType: e.target.value as any, targetValue: ''})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="all_students">جميع الطلاب</option>
                  <option value="all_teachers">جميع المدرسين</option>
                  <option value="preparatory_students">طلاب المرحلة الإعدادية</option>
                  <option value="secondary_students">طلاب المرحلة الثانوية</option>
                  <option value="specific_grade">صف محدد</option>
                  <option value="specific_subject_grade">مادة محددة</option>
                  <option value="specific_teacher_subject">مدرس مادة محددة</option>
                  <option value="specific_schedule">موعد محدد</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القيمة المحددة
                </label>
                {messageForm.targetType === 'specific_grade' && (
                  <select
                    value={messageForm.targetValue}
                    onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر الصف</option>
                    <option value="الأولى الإعدادي">الأولى الإعدادي</option>
                    <option value="الثانية الإعدادي">الثانية الإعدادي</option>
                    <option value="الثالثة الإعدادي">الثالثة الإعدادي</option>
                    <option value="الأولى الثانوي">الأولى الثانوي</option>
                    <option value="الثانية الثانوي">الثانية الثانوي</option>
                    <option value="الثالثة الثانوي">الثالثة الثانوي</option>
                  </select>
                )}

                {messageForm.targetType === 'specific_subject_grade' && (
                  <select
                    value={messageForm.targetValue}
                    onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                )}

                {messageForm.targetType === 'specific_teacher_subject' && (
                  <select
                    value={messageForm.targetValue}
                    onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                )}

                {messageForm.targetType === 'specific_schedule' && (
                  <select
                    value={messageForm.targetValue}
                    onChange={(e) => setMessageForm({...messageForm, targetValue: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر الموعد</option>
                    {schedules.map(schedule => {
                      const subject = subjects.find(s => s.id === schedule.subjectId);
                      const teacher = teachers.find(t => t.id === schedule.teacherId);
                      return (
                        <option key={schedule.id} value={schedule.id}>
                          {subject?.name} - {teacher?.name} - {schedule.dayOfWeek} {schedule.startTime}
                        </option>
                      );
                    })}
                  </select>
                )}

                {!['specific_grade', 'specific_subject_grade', 'specific_teacher_subject', 'specific_schedule'].includes(messageForm.targetType as string) && (
                  <input
                    type="text"
                    value={messageForm.targetValue}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    placeholder="لا تحتاج لقيمة محددة"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="isActive"
                checked={messageForm.isActive}
                onChange={(e) => setMessageForm({...messageForm, isActive: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                تفعيل الرسالة
              </label>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse">
              <button
                type="button"
                onClick={() => {
                  setMessageModalOpen(false);
                  setEditingMessage(null);
                  setMessageForm({
                    title: '',
                    content: '',
                    targetType: 'all_students',
                    targetValue: '',
                    priority: 'medium',
                    isActive: true
                  });
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingMessage ? 'تحديث الرسالة' : 'إضافة الرسالة'}
              </button>
            </div>
          </form>
        </Modal>

        {/* موديل تفاصيل الرسائل */}
        <Modal 
          isOpen={messagesDetailModalOpen} 
          onClose={() => setMessagesDetailModalOpen(false)}
          title="تفاصيل الرسائل"
        >
          <div className="max-w-4xl max-h-[80vh] overflow-y-auto">

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
                <div className="text-sm text-blue-600">إجمالي الرسائل</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{messages.filter(m => m.isActive).length}</div>
                <div className="text-sm text-green-600">رسائل مفعلة</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-600">{messages.filter(m => m.priority === 'high').length}</div>
                <div className="text-sm text-red-600">أولوية عالية</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-600">{messages.filter(m => m.priority === 'medium').length}</div>
                <div className="text-sm text-yellow-600">أولوية متوسطة</div>
              </div>
            </div>

            {/* تحليل حسب نوع المستهدفين */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">توزيع الرسائل حسب المستهدفين</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { type: 'all_students', label: 'جميع الطلاب', color: 'bg-blue-100 text-blue-800' },
                  { type: 'all_teachers', label: 'جميع المدرسين', color: 'bg-green-100 text-green-800' },
                  { type: 'preparatory_students', label: 'طلاب الإعدادية', color: 'bg-purple-100 text-purple-800' },
                  { type: 'secondary_students', label: 'طلاب الثانوية', color: 'bg-indigo-100 text-indigo-800' },
                  { type: 'specific_grade', label: 'صف محدد', color: 'bg-pink-100 text-pink-800' },
                  { type: 'specific_subject_grade', label: 'مادة محددة', color: 'bg-orange-100 text-orange-800' },
                  { type: 'specific_teacher_subject', label: 'مدرس مادة', color: 'bg-teal-100 text-teal-800' },
                  { type: 'specific_schedule', label: 'موعد محدد', color: 'bg-gray-100 text-gray-800' }
                ].map(({ type, label, color }) => {
                  const count = messages.filter(m => m.targetType === type).length;
                  return count > 0 ? (
                    <div key={type} className={`${color} px-3 py-2 rounded-lg text-sm font-medium`}>
                      {label}: {count}
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* قائمة الرسائل المفصلة */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">قائمة الرسائل المفصلة</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className={`border-l-4 p-4 rounded-lg ${
                      message.priority === 'high' ? 'border-red-500 bg-red-50' :
                      message.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 space-x-reverse mb-2">
                            <h4 className="font-semibold text-gray-800">{message.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(message.priority)}`}>
                              {getPriorityLabel(message.priority)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              message.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {message.isActive ? 'مفعلة' : 'معطلة'}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{message.content}</p>
                          <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-600">
                            <span>المستهدفون: {getTargetTypeLabel(message.targetType)}</span>
                            {message.targetValue && (
                              <span>القيمة: {message.targetValue}</span>
                            )}
                            <span>التاريخ: {new Date(message.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setMessagesDetailModalOpen(false);
                              handleEditMessage(message);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📬</div>
                    <p className="text-gray-500">لا توجد رسائل حالياً</p>
                  </div>
                )}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex justify-end space-x-2 space-x-reverse mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setMessagesDetailModalOpen(false);
                  setActiveTab('messages');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                إدارة الرسائل
              </button>
              <button
                onClick={() => setMessagesDetailModalOpen(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Admin;
