
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Clock, CheckCircle, XCircle, LogOut, Calendar, Star, MessageSquare, Award, CreditCard } from 'lucide-react';
import { Student, Teacher, getAllData, getMessagesForUser } from '../data/api';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState<{ type: 'student' | 'teacher'; data: Student | Teacher } | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // دالة لتحويل اليوم إلى العربية
  const getDayInArabic = (day: any) => {
    const daysMap: { [key: string]: string } = {
      'monday': 'الاثنين',
      'tuesday': 'الثلاثاء',
      'wednesday': 'الأربعاء',
      'thursday': 'الخميس',
      'friday': 'الجمعة',
      'saturday': 'السبت',
      'sunday': 'الأحد'
    };
    
    // إذا كان day مصفوفة، نعيد الأيام مفصولة بفواصل
    if (Array.isArray(day)) {
      return day.map(d => daysMap[d.toLowerCase()] || d).join('، ');
    }
    
    // إذا كان day نصية
    if (typeof day === 'string') {
      return daysMap[day.toLowerCase()] || day;
    }
    
    // إذا كان أي شيء آخر
    return day || 'غير محدد';
  };

  // دالة لحساب مدة انتهاء الشهر
  const getMonthEndDate = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toLocaleDateString('ar-EG');
  };

  // دالة لحساب بداية الشهر
  const getMonthStartDate = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toLocaleDateString('ar-EG');
  };

  // دالة لتحويل الوقت من نظام 24 ساعة إلى نظام 12 ساعة
  const convertTo12HourFormat = (time24: string) => {
    try {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'م' : 'ص';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return time24; // إرجاع الوقت الأصلي إذا فشل التحويل
    }
  };

  // دالة لحساب الحلقات المتبقية
  const calculateRemainingSessions = (schedule: any) => {
    try {
      if (!schedule.startDate || !schedule.endDate) return 'غير محدد';
      
      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);
      const today = new Date();
      
      // إذا انتهى الموعد
      if (today > endDate) return 'انتهى';
      
      // إذا لم يبدأ بعد
      if (today < startDate) {
        const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        return `${totalWeeks} حلقة`;
      }
      
      // حساب الحلقات المتبقية
      const remainingWeeks = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
      return `${remainingWeeks} حلقة متبقية`;
    } catch (error) {
      return 'غير محدد';
    }
  };

  // دالة لإنشاء رسالة الواتساب للطالب
  const createWhatsAppMessage = (student: any, subject: any, teacher: any) => {
    const message = `مرحباً إدارة المركز التعليمي،

أود التواصل معكم بخصوص الطالب/ة:
الاسم: ${student.name}
الصف: ${student.grade}
المرحلة الدراسية: ${student.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'}
المادة: ${subject?.name}
المدرس: ${teacher?.name}

أحتاج التواصل معكم بخصوص:
[يرجى كتابة سبب التواصل هنا]

شكراً لكم
${teacher?.name}`;

    return encodeURIComponent(message);
  };

  // دالة لفتح الواتساب
  const openWhatsApp = (student: any, subject: any, teacher: any) => {
    const message = createWhatsAppMessage(student, subject, teacher);
    const whatsappUrl = `https://wa.me/201024911062?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // دالة لتصفية الطلاب حسب البحث
  const filterStudents = (students: any[], searchTerm: string) => {
    if (!searchTerm.trim()) return students;
    
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.parentPhone.includes(searchTerm)
    );
  };

  useEffect(() => {
    const loadUserData = async () => {
      const user = localStorage.getItem('currentUser');
      if (!user) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(user);
      setCurrentUser(userData);

      // Load subjects data
      try {
        const data = await getAllData();
        if (data) {
          setSubjects(data.subjects);
          setSchedules(data.customSchedules || []);
          setStudents(data.students);
          setTeachers(data.teachers || []);
          
          // Update current user with latest data from server
          if (userData.type === 'student') {
            const updatedStudent = data.students.find(s => s.id === userData.data.id);
            if (updatedStudent) {
              setCurrentUser({ ...userData, data: updatedStudent });
            }
          }

          // Load user messages
          try {
            const userMessages = await getMessagesForUser(userData.data.id, userData.type);
            setMessages(userMessages);
          } catch (error) {
            console.error('Error loading messages:', error);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('حدث خطأ في تحميل البيانات');
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  if (!currentUser) {
    return null;
  }

  const renderStudentProfile = (student: Student) => (
    <div className="space-y-6">
      {/* Student Info Card - Modern Design */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse mb-6 sm:mb-8">
          <div className="self-center sm:self-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-primary from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 truncate">{student.name}</h1>
            <p className="text-gray-600 text-sm sm:text-lg mb-3">@{student.username}</p>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <span className="bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {student.gender === 'male' ? 'ذكر' : 'أنثى'}
              </span>
              <span className="bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {student.age} سنة
              </span>
              <span className="bg-purple-50 text-purple-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {student.grade}
              </span>
            </div>
          </div>
          <div className="text-center sm:text-right">
            {student.hasPaid ? (
              <div className="flex items-center justify-center sm:justify-start text-green-600 bg-green-50 px-3 sm:px-4 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">مدفوع الرسوم</span>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start text-red-600 bg-red-50 px-3 sm:px-4 py-2 rounded-xl">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">غير مدفوع الرسوم</span>
              </div>
            )}
          </div>
        </div>

        {/* Month Duration Info */}
        <div className="bg-primary from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600 flex-shrink-0" />
            مدة الاشتراك الشهري
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">بداية الشهر</p>
              <p className="font-bold text-indigo-600 text-sm sm:text-lg">{getMonthStartDate()}</p>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">نهاية الشهر</p>
              <p className="font-bold text-red-600 text-sm sm:text-lg">{getMonthEndDate()}</p>
            </div>
          </div>
        </div>

        {/* Total Price Display */}
        {student.totalPrice > 0 && (
          <div className="mt-4 sm:mt-6 bg-primary from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <span className="text-blue-800 font-semibold text-base sm:text-lg text-center sm:text-right">إجمالي الرسوم:</span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600 text-center sm:text-left">{student.totalPrice} جنيه</span>
            </div>
          </div>
        )}
      </div>

      {/* الإشعارات والرسائل - قسم جديد */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3 text-blue-500" />
          الإشعارات والرسائل
        </h2>
        
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`border-r-4 p-6 rounded-2xl ${
                message.priority === 'high' ? 'border-red-500 bg-red-50' :
                message.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">{message.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">{message.content}</p>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        message.priority === 'high' ? 'bg-red-100 text-red-800' :
                        message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.priority === 'high' ? 'عالية' : 
                         message.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </span>
                      <span className="font-medium">{new Date(message.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد إشعارات أو رسائل حالياً</h3>
            <p className="text-gray-500">ستظهر هنا الإشعارات والرسائل الموجهة لك من إدارة المركز</p>
          </div>
        )}
      </div>

      {/* Student Schedule - Improved Design */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-orange-500" />
          المواعيد المتاحة
        </h2>
        
        {schedules.filter(schedule => 
          student.enrolledSubjects.includes(schedule.subjectId)
        ).length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {schedules
              .filter(schedule => student.enrolledSubjects.includes(schedule.subjectId))
              .map(schedule => {
                const subject = subjects.find(s => s.id === schedule.subjectId);
                const teacher = teachers.find(t => t.id === schedule.teacherId);
                
                return (
                  <div key={schedule.id} className="bg-primary from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{subject?.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">{getDayInArabic(schedule.dayOfWeek)}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="text-sm">⏰ {convertTo12HourFormat(schedule.startTime)} - {convertTo12HourFormat(schedule.endTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="text-sm">📅 بداية: {schedule.startDate || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="text-sm">📅 انتهاء: {schedule.endDate || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="text-sm">📊 {calculateRemainingSessions(schedule)}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="text-sm">📍 القاعة: {schedule.room}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        schedule.scheduleType === 'weekly' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {schedule.scheduleType === 'weekly' ? 'أسبوعي' : 'منفرد'}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-medium">لا توجد مواعيد متاحة حالياً</p>
            <p className="text-gray-500 mt-2">سيتم إضافة المواعيد قريباً</p>
          </div>
        )}
      </div>

      {/* Enrolled Subjects - Improved with Teacher Names */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-blue-500" />
          المواد المسجلة
        </h2>
        
        {student.enrolledSubjects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {student.enrolledSubjects.map(subjectId => {
              const subject = subjects.find(s => s.id === subjectId);
              const isPaid = student.paidSubjects.includes(subjectId);
              
              // البحث عن المدرس للمادة
              const teacherSchedule = schedules.find(schedule => schedule.subjectId === subjectId);
              let teacher = null;
              
              // البحث في قائمة المدرسين من خلال المواعيد أولاً
              if (teacherSchedule) {
                teacher = teachers.find(t => t.id === teacherSchedule.teacherId);
              }
              
              // إذا لم نجد مدرس من المواعيد، نبحث في قائمة المدرسين مباشرة
              if (!teacher) {
                teacher = teachers.find(t => t.subjects && t.subjects.includes(subjectId));
              }
              
              return subject ? (
                <div key={subjectId} className="bg-primary from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                    {isPaid ? (
                      <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                        مدفوع
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold border border-red-200">
                        غير مدفوع
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{subject.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-medium">{subject.price} جنيه</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">{subject.duration}</span>
                      </div>
                    </div>
                    {teacher && (
                      <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-semibold">المدرس: {teacher.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-medium">لم يتم التسجيل في أي مواد بعد</p>
            <p className="text-gray-500 mt-2">قم بالتسجيل في المواد المتاحة</p>
          </div>
        )}
      </div>

      {/* النقاط والملاحظات - Modern Design */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Star className="w-6 h-6 mr-3 text-yellow-500" />
          النقاط والملاحظات
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* النقاط */}
          <div className="bg-primary from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-yellow-800">النقاط المكتسبة</h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="text-3xl font-bold text-yellow-600">{student.points !== undefined ? student.points : 0}</span>
              </div>
            </div>
            <p className="text-sm text-yellow-700 mb-4 leading-relaxed">
              النقاط التي حصلت عليها من التفاعل والإنجازات في المركز
            </p>
            <div className="bg-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-800 font-medium">المستوى الحالي:</span>
                <span className="font-bold text-yellow-700">
                  {(student.points || 0) >= 1000 ? 'ممتاز' : 
                   (student.points || 0) >= 500 ? 'جيد جداً' : 
                   (student.points || 0) >= 200 ? 'جيد' : 
                   (student.points || 0) >= 50 ? 'مقبول' : 'مبتدئ'}
                </span>
              </div>
            </div>
          </div>
          
          {/* الملاحظات */}
          <div className="bg-primary from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              ملاحظات المدرس
            </h3>
            {student.notes && student.notes.trim() !== '' ? (
              <div className="bg-blue-100 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-700 leading-relaxed text-sm">{student.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-blue-600 font-medium">لا توجد ملاحظات حالياً</p>
                <p className="text-blue-500 text-xs mt-2">سيتم إضافة الملاحظات من قبل المدرس</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* الشهادات - Modern Design */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Award className="w-6 h-6 mr-3 text-purple-500" />
          الشهادات والإنجازات
        </h2>
        
        {student.certificates && Array.isArray(student.certificates) && student.certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {student.certificates.map((certificate, index) => (
              <div key={index} className="bg-primary from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
                  <img
                    src={certificate}
                    alt={`شهادة ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTcgMTIwIDExOSAxMTEuNDU3IDExOSAxMDFDMTE5IDkwLjU0MzEgMTEwLjQ1NyA4MiAxMDAgODJDODkuNTQzMSA4MiA4MSA5MC41NDMxIDgxIDEwMUM4MSAxMTEuNDU3IDg5LjU0MzEgMTIwIDEwMCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzg5LjU0MzEgMTMwIDgxIDEzNy41NDMgODEgMTQ4SDEyMEMxMjAgMTM3LjU0MyAxMTEuNDU3IDEzMCAxMDAgMTMwWiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-purple-800 mb-3">شهادة {index + 1}</h4>
                  <div className="flex justify-center space-x-2 space-x-reverse">
                    <a
                      href={certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 transition-colors bg-purple-100 px-4 py-2 rounded-full hover:bg-purple-200 font-medium"
                    >
                      عرض الشهادة
                    </a>
                    <button
                      onClick={() => window.open(certificate, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors bg-blue-100 px-4 py-2 rounded-full hover:bg-blue-200 font-medium"
                    >
                      تحميل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Award className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد شهادات حالياً</h3>
            <p className="text-gray-500">سيتم إضافة الشهادات والإنجازات هنا عند الحصول عليها</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeacherProfile = (teacher: Teacher) => (
    <div className="space-y-6">
      {/* Teacher Info Card - Enhanced Design */}
      <div className="bg-primary from-white via-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-primary from-green-500 via-teal-500 to-blue-600 px-4 sm:px-8 py-6 sm:py-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8 lg:space-x-reverse">
            {/* صورة المدرس المحسنة */}
            <div className="relative self-center lg:self-auto">
              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-3xl sm:rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-white/20 backdrop-blur-sm border-4 sm:border-6 lg:border-8 border-white/30 flex items-center justify-center shadow-2xl">
                {teacher.photo ? (
                  <img 
                    src={teacher.photo} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover object-center" 
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTcgMTIwIDExOSAxMTEuNDU3IDExOSAxMDFDMTE5IDkwLjU0MzEgMTEwLjQ1NyA4MiAxMDAgODJDODkuNTQzMSA4MiA4MSA5MC41NDMxIDgxIDEwMUM4MSAxMTEuNDU3IDg5LjU0MzEgMTIwIDEwMCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzg5LjU0MzEgMTMwIDgxIDEzNy41NDMgODEgMTQ4SDEyMEMxMjAgMTM3LjU0MyAxMTEuNDU3IDEzMCAxMDAgMTMwWiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <User className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" />
                )}
              </div>
              {/* مؤشر الحالة */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-green-400 border-3 sm:border-4 lg:border-5 border-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* معلومات المدرس */}
            <div className="flex-1 text-center lg:text-right">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 drop-shadow-sm truncate">{teacher.name}</h1>
              <p className="text-blue-100 text-base sm:text-lg lg:text-xl mb-4 sm:mb-5 flex items-center justify-center lg:justify-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="truncate">{teacher.email}</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center lg:items-start space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold border border-white/30 whitespace-nowrap">
                  🎓 مدرس متخصص
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium border border-white/30 whitespace-nowrap">
                  📚 {teacher.subjects.length} مادة
                </span>
              </div>
            </div>

          </div>

        </div>
        
        {/* قسم المعلومات الإضافية */}
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-white/50 hover:bg-white/70 transition-colors">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{teacher.subjects.length}</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">المواد المسندة</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-white/50 hover:bg-white/70 transition-colors">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                {schedules.filter(schedule => teacher.subjects.includes(schedule.subjectId)).length}
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">المواعيد النشطة</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-white/50 hover:bg-white/70 transition-colors">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                {students.filter(student => 
                  student.enrolledSubjects.some(subjectId => 
                    teacher.subjects.includes(subjectId)
                  )
                ).length}
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">الطلاب المسجلون</div>
            </div>
          </div>
        </div>
      </div>

      {/* الرسائل - Modern Design */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3 text-blue-500" />
          الرسائل والإشعارات
        </h2>
        
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`border-r-4 p-6 rounded-2xl ${
                message.priority === 'high' ? 'border-red-500 bg-red-50' :
                message.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">{message.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">{message.content}</p>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        message.priority === 'high' ? 'bg-red-100 text-red-800' :
                        message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.priority === 'high' ? 'عالية' : 
                         message.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </span>
                      <span className="font-medium">{new Date(message.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد رسائل حالياً</h3>
            <p className="text-gray-500">ستظهر هنا الرسائل والإشعارات الموجهة لك</p>
          </div>
        )}
      </div>

      {/* Teaching Subjects - Modern Design */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-green-500" />
          المواد التي أدرسها
        </h2>
        
        {teacher.subjects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {teacher.subjects.map(subjectId => {
              const subject = subjects.find(s => s.id === subjectId);
              
              return subject ? (
                <div key={subjectId} className="bg-primary from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{subject.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{subject.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-medium">{subject.price} جنيه</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">{subject.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-medium">لم يتم تعيين مواد للتدريس بعد</p>
            <p className="text-gray-500 mt-2">سيتم تعيين المواد قريباً</p>
          </div>
        )}
      </div>

      {/* Teacher schedules and expected students - Modern Design */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-orange-500" />
          المواعيد والطلاب المتوقعون
        </h2>
        
        {schedules.filter(schedule => 
          teacher.subjects.includes(schedule.subjectId)
        ).length > 0 ? (
          <div className="space-y-6">
            {schedules
              .filter(schedule => teacher.subjects.includes(schedule.subjectId))
              .map(schedule => {
                const subject = subjects.find(s => s.id === schedule.subjectId);
                const expectedStudents = students.filter(student => 
                  student.selectedSubjects.includes(schedule.subjectId) && 
                  student.hasPaid &&
                  student.paidSubjects.includes(schedule.subjectId)
                );
                
                return (
                  <div key={schedule.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {/* رأس الموعد */}
                    <div className="bg-primary from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 truncate">{subject?.name}</h3>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center text-gray-700">
                              <Clock className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                              <span className="font-medium text-sm sm:text-base truncate">{getDayInArabic(schedule.dayOfWeek)}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-xs sm:text-sm">⏰ {convertTo12HourFormat(schedule.startTime)} - {convertTo12HourFormat(schedule.endTime)}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-xs sm:text-sm">📅 بداية: {schedule.startDate || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-xs sm:text-sm">📅 انتهاء: {schedule.endDate || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-xs sm:text-sm">📊 {calculateRemainingSessions(schedule)}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-xs sm:text-sm">📍 القاعة: {schedule.room}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold self-start sm:self-auto ${
                          schedule.scheduleType === 'weekly' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {schedule.scheduleType === 'weekly' ? 'أسبوعي' : 'منفرد'}
                        </span>
                      </div>
                    </div>
                    
                    {/* قسم الطلاب */}
                    <div className="p-4 sm:p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <User className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base">الطلاب المتوقعون ({expectedStudents.length})</span>
                      </h4>
                      
                      {/* حقل البحث */}
                      {expectedStudents.length > 0 && (
                        <div className="mb-4">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="البحث في أسماء الطلاب..."
                              value={studentSearchTerm}
                              onChange={(e) => setStudentSearchTerm(e.target.value)}
                              className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            {studentSearchTerm && (
                              <button
                                onClick={() => setStudentSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {expectedStudents.length > 0 ? (
                                                <div className="space-y-2">
                          {filterStudents(expectedStudents, studentSearchTerm).length > 0 ? (
                            filterStudents(expectedStudents, studentSearchTerm).map(student => (
                              <div key={student.id} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-colors">
                              {/* معلومات الطالب الأساسية */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
                                  <div className="min-w-0 flex-1">
                                    <h5 className="font-bold text-gray-900 text-sm truncate">{student.name}</h5>
                                    <p className="text-gray-600 text-xs">{student.grade} • {student.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'}</p>
                                  </div>
                                </div>
                                
                                {/* الأزرار والأيقونات */}
                                <div className="flex items-center space-x-2 space-x-reverse flex-wrap gap-2">
                                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                    <Star className="w-3 h-3 text-yellow-600 mr-1 flex-shrink-0" />
                                    <span className="text-xs font-semibold text-yellow-700">{student.points || 0} نقطة</span>
                                  </div>
                                  <button
                                    onClick={() => openWhatsApp(student, subject, teacher)}
                                    className="flex items-center bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0"
                                  >
                                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                    <span className="hidden sm:inline">واتساب</span>
                                    <span className="sm:hidden">📱</span>
                                  </button>
                                </div>
                              </div>
                              
                              {/* معلومات الاتصال */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                                <span className="truncate">📞 {student.phone}</span>
                                <span className="truncate">👨‍👩‍👧‍👦 {student.parentPhone}</span>
                              </div>
                                                          </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <p className="text-sm text-gray-500">لا توجد نتائج للبحث: "{studentSearchTerm}"</p>
                              <button
                                onClick={() => setStudentSearchTerm('')}
                                className="text-blue-500 hover:text-blue-700 text-xs mt-2 underline"
                              >
                                إظهار جميع الطلاب
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">لا يوجد طلاب مسجلون</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-medium">لم يتم تعيين مواعيد بعد</p>
            <p className="text-gray-500 mt-2">سيتم تعيين المواعيد قريباً</p>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-primary from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="pt-8 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 space-x-reverse bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 transition-colors font-semibold shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span> الخروج</span>
            </button>
          </div>

          {/* Profile Content */}
          {currentUser.type === 'student' 
            ? renderStudentProfile(currentUser.data as Student)
            : renderTeacherProfile(currentUser.data as Teacher)
          }
        </div>
      </div>
    </div>
  );
};

export default Profile;
