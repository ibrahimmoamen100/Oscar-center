
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, Plus, X, Calendar, Phone, Mail, MapPin, BookOpen, Star, Send } from 'lucide-react';
import { loginStudent, loginTeacher, getAllData, calculateAge } from '../data/api';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const Login = () => {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const navigate = useNavigate();

  // نموذج تسجيل الطالب الجديد
  const [studentForm, setStudentForm] = useState({
    name: '',
    username: '',
    password: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    age: 0,
    educationLevel: 'preparatory' as 'preparatory' | 'secondary',
    grade: '',
    phone: '',
    parentPhone: '',
    photo: '',
    selectedSubjects: [] as string[],
    totalPrice: 0
  });

  // تحميل البيانات عند فتح النموذج
  useEffect(() => {
    if (showRegistrationForm) {
      loadData();
    }
  }, [showRegistrationForm]);

  const loadData = async () => {
    try {
      const data = await getAllData();
      if (data) {
        setSubjects(data.subjects || []);
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // دالة لحساب العمر
  useEffect(() => {
    if (studentForm.birthDate) {
      const calculatedAge = calculateAge(studentForm.birthDate);
      setStudentForm(prev => ({ ...prev, age: calculatedAge }));
    }
  }, [studentForm.birthDate]);

  // دالة لحساب السعر الإجمالي
  useEffect(() => {
    const totalPrice = studentForm.selectedSubjects.reduce((sum, subjectId) => {
      const subject = subjects.find(s => s.id === subjectId);
      return sum + (subject?.price || 0);
    }, 0);
    setStudentForm(prev => ({ ...prev, totalPrice }));
  }, [studentForm.selectedSubjects, subjects]);

  // دالة للحصول على الصفوف حسب المرحلة
  const getGradesForLevel = (level: 'preparatory' | 'secondary') => {
    if (level === 'preparatory') {
      return ['الأولى الإعدادي', 'الثانية الإعدادي', 'الثالثة الإعدادي'];
    } else {
      return ['الأولى الثانوي', 'الثانية الثانوي', 'الثالثة الثانوي'];
    }
  };

  // دالة للحصول على المواد المتاحة
  const getAvailableSubjects = () => {
    return subjects.filter(subject => 
      subject.educationLevel === studentForm.educationLevel && 
      (Array.isArray(subject.grade) ? subject.grade.includes(studentForm.grade) : subject.grade === studentForm.grade)
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userType === 'student') {
        const student = await loginStudent(email, password);
        if (student) {
          localStorage.setItem('currentUser', JSON.stringify({ type: 'student', data: student }));
          toast.success('تم تسجيل الدخول بنجاح!');
          navigate('/profile');
        } else {
          toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      } else {
        const teacher = await loginTeacher(email, password);
        if (teacher) {
          localStorage.setItem('currentUser', JSON.stringify({ type: 'teacher', data: teacher }));
          toast.success('تم تسجيل الدخول بنجاح!');
          navigate('/profile');
        } else {
          toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // دالة إرسال بيانات الطالب عبر الواتساب
  const sendStudentDataViaWhatsApp = () => {
    const selectedSubjectsInfo = studentForm.selectedSubjects.map(subjectId => {
      const subject = subjects.find(s => s.id === subjectId);
      const teacher = teachers.find(t => t.subjects.includes(subjectId));
      return `• ${subject?.name} - ${subject?.price} جنيه${teacher ? ` (المدرس: ${teacher.name})` : ''}`;
    }).join('\n');

    const message = `🎓 *طلب تسجيل طالب جديد*

*البيانات الشخصية:*
👤 الاسم: ${studentForm.name}
👤 اسم المستخدم: ${studentForm.username}
🔐 كلمة المرور: ${studentForm.password}
👦 النوع: ${studentForm.gender === 'male' ? 'ذكر' : 'أنثى'}
📅 تاريخ الميلاد: ${studentForm.birthDate}
🎂 العمر: ${studentForm.age} سنة

*البيانات التعليمية:*
📚 المرحلة: ${studentForm.educationLevel === 'preparatory' ? 'إعدادي' : 'ثانوي'}
📖 الصف: ${studentForm.grade}

*معلومات الاتصال:*
📱 هاتف الطالب: ${studentForm.phone}
👨‍👩‍👧‍👦 هاتف ولي الأمر: ${studentForm.parentPhone}
🖼️ رابط الصورة: ${studentForm.photo || 'غير محدد'}

*المواد المختارة:*
${selectedSubjectsInfo}

💰 *إجمالي الرسوم: ${studentForm.totalPrice} جنيه*

---
*تم إرسال هذا الطلب من صفحة تسجيل الدخول*
*يرجى مراجعة البيانات وإضافة الطالب للنظام*`;

    const whatsappUrl = `https://wa.me/201024911062?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('تم إرسال بيانات الطالب لإدارة المركز عبر الواتساب');
    setShowRegistrationForm(false);
    resetForm();
  };

  // دالة إعادة تعيين النموذج
  const resetForm = () => {
    setStudentForm({
      name: '',
      username: '',
      password: '',
      gender: 'male',
      birthDate: '',
      age: 0,
      educationLevel: 'preparatory',
      grade: '',
      phone: '',
      parentPhone: '',
      photo: '',
      selectedSubjects: [],
      totalPrice: 0
    });
  };

  // دالة التحقق من صحة النموذج
  const isFormValid = () => {
    return studentForm.name && 
           studentForm.username && 
           studentForm.password && 
           studentForm.birthDate && 
           studentForm.grade && 
           studentForm.phone && 
           studentForm.parentPhone &&
           studentForm.selectedSubjects.length > 0;
  };

  return (
    <div className="min-h-screen bg-primary from-blue-50 via-white to-green-50">
      <Navbar />
      
      <div className="pt-8 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-primary from-blue-600 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">تسجيل الدخول</h1>
              <p className="text-gray-600">ادخل بياناتك للوصول إلى حسابك</p>
            </div>

            {/* User Type Selector */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 ${
                    userType === 'student'
                      ? 'bg-white shadow-md text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  طالب
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('teacher')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 ${
                    userType === 'teacher'
                      ? 'bg-white shadow-md text-green-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  مدرس
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'student' ? 'اسم المستخدم' : 'البريد الإلكتروني'}
                </label>
                <input
                  type={userType === 'student' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={userType === 'student' ? 'ادخل اسم المستخدم' : 'ادخل بريدك الإلكتروني'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ادخل كلمة المرور"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                  userType === 'student'
                    ? 'bg-primary from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    : 'bg-primary from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                } ${loading ? 'opacity-75 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>

            {/* زر تسجيل طالب جديد */}
            {userType === 'student' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="w-full py-3 px-4 bg-primary from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  تسجيل طالب جديد
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  ليس لديك حساب؟ اضغط هنا لتسجيل طالب جديد
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal تسجيل الطالب الجديد */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">تسجيل طالب جديد</h2>
                    <p className="text-gray-600">أدخل بيانات الطالب لإرسالها لإدارة المركز</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRegistrationForm(false);
                    resetForm();
                  }}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* البيانات الشخصية */}
              <div className="bg-primary from-blue-50 to-indigo-50 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  البيانات الشخصية
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم الطالب</label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                    <input
                      type="text"
                      value={studentForm.username}
                      onChange={(e) => setStudentForm({...studentForm, username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                    <input
                      type="password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={studentForm.birthDate}
                      onChange={(e) => setStudentForm({...studentForm, birthDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العمر</label>
                    <input
                      type="number"
                      value={studentForm.age}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* البيانات التعليمية */}
              <div className="bg-primary from-green-50 to-emerald-50 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                  البيانات التعليمية
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المرحلة التعليمية</label>
                    <select
                      value={studentForm.educationLevel}
                      onChange={(e) => setStudentForm({...studentForm, educationLevel: e.target.value as 'preparatory' | 'secondary'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="preparatory">إعدادي</option>
                      <option value="secondary">ثانوي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الصف الدراسي</label>
                    <select
                      value={studentForm.grade}
                      onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      disabled={!studentForm.educationLevel}
                    >
                      <option value="">اختر الصف</option>
                      {getGradesForLevel(studentForm.educationLevel).map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* معلومات الاتصال */}
              <div className="bg-primary from-purple-50 to-pink-50 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-purple-600" />
                  معلومات الاتصال
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم هاتف الطالب</label>
                    <input
                      type="tel"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="01xxxxxxxxx"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم هاتف ولي الأمر</label>
                    <input
                      type="tel"
                      value={studentForm.parentPhone}
                      onChange={(e) => setStudentForm({...studentForm, parentPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="01xxxxxxxxx"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (اختياري)</label>
                    <input
                      type="url"
                      value={studentForm.photo}
                      onChange={(e) => setStudentForm({...studentForm, photo: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* المواد الدراسية */}
              {studentForm.grade && (
                <div className="bg-primary from-orange-50 to-red-50 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-orange-600" />
                    المواد الدراسية
                  </h3>
                  <div className="grid gap-3">
                    {getAvailableSubjects().map(subject => {
                      const teacher = teachers.find(t => t.subjects.includes(subject.id));
                      const isSelected = studentForm.selectedSubjects.includes(subject.id);
                      
                      return (
                        <div
                          key={subject.id}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-orange-500 bg-orange-50' 
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
                              <span className="text-orange-600 font-bold">{subject.price} جنيه</span>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="ml-3 w-5 h-5 text-orange-600"
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
                        </div>
                      );
                    })}
                  </div>
                  
                  {studentForm.selectedSubjects.length > 0 && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">إجمالي الرسوم:</span>
                        <span className="text-2xl font-bold text-orange-600">{studentForm.totalPrice} جنيه</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white rounded-b-3xl p-6 border-t border-gray-200">
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => {
                    setShowRegistrationForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={sendStudentDataViaWhatsApp}
                  disabled={!isFormValid()}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                    isFormValid()
                      ? 'bg-primary from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5 mr-2" />
                  إرسال لإدارة المركز
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
