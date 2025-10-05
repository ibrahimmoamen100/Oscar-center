
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, BookOpen, Award, Clock, Star, Trophy, Target, TrendingUp, Shield, Zap, BookMarked, GraduationCap, Calendar, DollarSign, UserCheck, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getAllData } from '../data/api';
import CENTER_CONSTANTS, { getFullName, getShortName, getStats } from '../../constants';

const Index = () => {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<{ [subjectId: string]: boolean }>({});
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // بيانات الـ Carousel
  const carouselSlides = [
    {
      id: 1,
      image: "https://gate.ahram.org.eg/daily/Media/News/2018/9/28/2018-636737682232396910-239.jpg", title: "مرحباً بكم في مركز التميز التعليمي",
      subtitle: "نظام تعليمي متكامل يعتمد على المتابعة الشخصية والتشجيع المستمر",
      description: "نحقق معاً أحلام الطلاب من خلال تعليم متميز ومدرسين متخصصين",
      buttonText: "ابدأ رحلتك التعليمية",
      buttonLink: "/login",
      overlay: "rgba(0, 0, 0, 0.4)"
    },
    {
      id: 2,
      image: "https://media.elwatannews.com/media/img/mediaarc/large/9795335111635970400.jpg", title: "مدرسون متخصصون وخبراء",
      subtitle: "فريق من أفضل المدرسين المؤهلين في جميع المواد",
      description: "خبرة تزيد عن 10 سنوات في مجال التعليم مع معدلات نجاح عالية",
      buttonText: "ابدأ رحلتك التعليمية",
      buttonLink: "/login",
      overlay: "rgba(59, 130, 246, 0.5)"
    },
    {
      id: 3,
      image: "https://gate.ahram.org.eg/Media/News/2022/10/20/19_2022-638018810177653303-765.jpg", title: "نتائج مضمونة ومعدلات نجاح عالية",
      subtitle: "معدلات نجاح تصل إلى 95% وتحسن ملحوظ في الدرجات",
      description: "نظام تشجيعي متطور مع متابعة شخصية لكل طالب",
      buttonText: "ابدأ رحلتك التعليمية",
      buttonLink: "/login",
      overlay: "rgba(16, 185, 129, 0.5)"
    },
    {
      id: 4,
      image: "https://gate.ahram.org.eg/daily/Media/News/2018/9/28/2018-636737682232396910-239.jpg",
      title: "مرونة في المواعيد وجداول مخصصة",
      subtitle: "جداول مرنة تناسب جميع الطلاب مع إمكانية تعديل المواعيد",
      description: "نظام جدولة ذكي يتكيف مع احتياجات كل طالب",
      buttonText: "ابدأ رحلتك التعليمية",
      buttonLink: "/login",
      overlay: "rgba(147, 51, 234, 0.5)"
    }
  ];

  // دالة للانتقال للشريحة التالية
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  // دالة للانتقال للشريحة السابقة
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  // دالة للانتقال لشريحة محددة
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // دالة لإرسال رسالة واتساب لإدارة المركز
  const sendWhatsAppMessage = () => {
    const message = "مرحباً، أود الاستفسار عن خدمات المركز التعليمي والانضمام للدورات المتاحة. شكراً لكم.";
    const phoneNumber = "201024911062"; // رقم هاتف إدارة المركز
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // دالة لإدارة اختيار المدرسين
  const toggleTeacherSelection = (subjectId: string) => {
    setSelectedTeachers(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // دالة لحساب إجمالي الأسعار للمواد المختارة فقط
  const calculateSelectedTotalPrice = () => {
    if (!selectedGradeData) return 0;

    return selectedGradeData.subjects.reduce((sum, subject) => {
      if (selectedTeachers[subject.id]) {
        return sum + (subject.price || 0);
      }
      return sum;
    }, 0);
  };

  // دالة لحساب عدد المواد المختارة
  const getSelectedSubjectsCount = () => {
    return Object.values(selectedTeachers).filter(Boolean).length;
  };

  // دالة لإرسال رسالة حجز للصف المحدد مع المدرسين المختارين فقط
  const sendBookingMessage = () => {
    if (!selectedGradeData) return;

    const gradeName = selectedGradeData.name;
    const selectedSubjectsList = selectedGradeData.subjects
      .filter(subject => selectedTeachers[subject.id])
      .map(subject =>
        `• ${subject.name} - ${subject.teacher?.name || 'لم يتم تعيين مدرس بعد'}`
      );

    const totalPrice = calculateSelectedTotalPrice();
    const selectedCount = getSelectedSubjectsCount();

    let message = `السلام عليكم ورحمة الله وبركاته

أود الحجز في الصف: ${gradeName}

المواد والمدرسين المختارين:
${selectedSubjectsList.join('\n')}

عدد المواد المختارة: ${selectedCount} مواد
إجمالي الرسوم الشهرية: ${totalPrice} جنيه

أرجو التواصل معي لتأكيد الحجز وتحديد المواعيد المناسبة.

شكراً لكم
مركز الأكاديمي فولت`;

    // إذا لم يتم اختيار أي مدرس، أرسل رسالة تشمل جميع المواد
    if (selectedCount === 0) {
      const allSubjectsList = selectedGradeData.subjects.map(subject =>
        `• ${subject.name} - ${subject.teacher?.name || 'لم يتم تعيين مدرس بعد'}`
      ).join('\n');

      const allTotalPrice = selectedGradeData.subjects.reduce((sum, subject) => sum + (subject.price || 0), 0);

      message = `السلام عليكم ورحمة الله وبركاته

أود الحجز في الصف: ${gradeName}

المواد والمدرسين:
${allSubjectsList}

إجمالي الرسوم الشهرية: ${allTotalPrice} جنيه

أرجو التواصل معي لتأكيد الحجز وتحديد المواعيد المناسبة.

شكراً لكم
مركز الأكاديمي فولت`;
    }

    const phoneNumber = "201024911062"; // رقم هاتف إدارة المركز
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Auto-play للـ carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // تغيير كل 5 ثواني

    return () => clearInterval(interval);
  }, []);

  // Pause auto-play on hover
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // مميزات المركز
  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "مدرسون متخصصون",
      description: "فريق من أفضل المدرسين المؤهلين في جميع المواد مع خبرة تزيد عن 10 سنوات"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      title: "مناهج حديثة",
      description: "مناهج محدثة تواكب أحدث التطورات التعليمية والامتحانات الرسمية"
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "مرونة في المواعيد",
      description: "جداول مرنة تناسب جميع الطلاب مع إمكانية تعديل المواعيد"
    },
    {
      icon: <Award className="w-8 h-8 text-orange-600" />,
      title: "نتائج مضمونة",
      description: "معدلات نجاح عالية تصل إلى 95% وتحسن ملحوظ في الدرجات"
    },
    {
      icon: <Target className="w-8 h-8 text-red-600" />,
      title: "متابعة شخصية",
      description: "متابعة فردية لكل طالب مع تقارير دورية للأهل"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      title: "نظام تشجيعي",
      description: "نظام نقاط وجوائز لتحفيز الطلاب على التفوق والتميز"
    }
  ];

  // نظام التشجيع والمتابعة
  const encouragementSystem = [
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "نظام النقاط",
      description: "اكسب نقاط لكل إنجاز وتحسن في الأداء"
    },
    {
      icon: <Trophy className="w-6 h-6 text-orange-500" />,
      title: "جوائز شهرية",
      description: "جوائز قيمة للطلاب المتفوقين كل شهر"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: "متابعة التقدم",
      description: "تقارير مفصلة عن تقدم الطالب عبر الموقع"
    },
    {
      icon: <Shield className="w-6 h-6 text-red-500" />,
      title: "دعم نفسي",
      description: "دعم وتحفيز مستمر لبناء الثقة بالنفس"
    }
  ];

  // الطلاب المتميزون - من البيانات الحقيقية
  const topStudents = students
    .filter(student => student.points && student.points > 1000)
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 4)
    .map(student => ({
      name: student.name,
      grade: student.grade,
      points: student.points || 0,
      certificates: student.certificates || [],
      photo: student.photo
    }));

  // دالة لتحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllData();
        if (data) {
          setTeachers(data.teachers || []);
          setSubjects(data.subjects || []);
          setStudents(data.students || []);
          setSchedules(data.customSchedules || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // تعيين الصف الثالث الثانوي كاختيار افتراضي بعد تحميل البيانات
  useEffect(() => {
    if (subjects.length > 0 && teachers.length > 0 && !selectedGrade) {
      const grades = organizeSubjectsByGrade();
      const thirdSecondaryGrade = grades.find(grade =>
        grade.name.includes('الثالث الثانوي') ||
        grade.name.includes('الصف الثالث الثانوي') ||
        grade.name.includes('ثالثة ثانوي') ||
        grade.name.includes('الثالثة الثانوي')
      );
      if (thirdSecondaryGrade) {
        setSelectedGrade(thirdSecondaryGrade.id);
      }
    }
  }, [subjects, teachers, selectedGrade]);

  // دالة لتنظيم المواد حسب الصفوف
  const organizeSubjectsByGrade = () => {
    const gradeMap: { [key: string]: any } = {};

    subjects.forEach(subject => {
      if (subject.grade && Array.isArray(subject.grade)) {
        subject.grade.forEach((gradeName: string) => {
          if (!gradeMap[gradeName]) {
            gradeMap[gradeName] = {
              id: gradeName,
              name: gradeName,
              level: gradeName.includes('إعدادي') ? 'إعدادي' : 'ثانوي',
              subjects: []
            };
          }

          // البحث عن المدرس للمادة
          const teacher = teachers.find(t =>
            t.subjects && t.subjects.includes(subject.id)
          );

          gradeMap[gradeName].subjects.push({
            id: subject.id,
            name: subject.name,
            description: subject.description,
            price: subject.price,
            teacher: teacher ? {
              id: teacher.id,
              name: teacher.name,
              photo: teacher.photo,
              email: teacher.email
            } : null
          });
        });
      }
    });

    return Object.values(gradeMap);
  };

  const grades = organizeSubjectsByGrade();



  const selectedGradeData = grades.find(grade => grade.id === selectedGrade);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Carousel Section */}
      <section
        className="relative h-screen min-h-[600px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel Slides */}
        <div className="relative w-full h-full">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: slide.overlay }}
              />

              {/* Content */}
              <div className="relative z-20 h-full flex items-center justify-center pt-8 sm:pt-12">
                <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 md:mb-6 opacity-90 font-medium">
                    {slide.subtitle}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 opacity-80 max-w-3xl mx-auto leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link
                      to={slide.buttonLink}
                      className="bg-white text-gray-800 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {slide.buttonText}
                    </Link>
                    <button
                      onClick={sendWhatsAppMessage}
                      className="bg-green-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      تواصل معنا
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 space-x-reverse">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
          <div
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${((currentSlide + 1) / carouselSlides.length) * 100}%` }}
          />
        </div>
      </section>







      {/* Grades and Subjects Section */}
      <section className="py-20 px-4 bg-white from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary from-blue-600 to-purple-600 rounded-full mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-800 bg-primary from-blue-600 to-purple-600 bg-clip-text text-transparent">
              الصفوف والمواد الدراسية
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              اختر صفك لمعرفة المواد والمدرسين والأسعار المميزة
            </p>
          </div>

          {/* Grade Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {grades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => {
                  setSelectedGrade(grade.id);
                  setSelectedTeachers({}); // إعادة تعيين الاختيارات عند تغيير الصف
                }}
                className={`group relative p-6 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 ${selectedGrade === grade.id
                    ? 'bg-primary from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl'
                    : 'bg-white text-gray-700 hover:bg-primary hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl'
                  }`}
              >
                <div className="relative z-10">
                  <div className="text-lg font-bold mb-2">{grade.name}</div>
                  <div className={`text-sm ${selectedGrade === grade.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {grade.level}
                  </div>
                </div>
                {selectedGrade === grade.id && (
                  <div className="absolute inset-0 bg-primary from-blue-600 via-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Grade Details */}
          {selectedGradeData && (
            <>
              <div className="text-center mb-12">
                <h3 className="text-4xl font-bold text-gray-800 mb-4">
                  {selectedGradeData.name}
                </h3>
                <p className="text-xl text-gray-600">
                  المواد والمدرسين المتميزون
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {selectedGradeData.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className={`group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 overflow-hidden transform hover:scale-105 hover:-translate-y-2 cursor-pointer ${selectedTeachers[subject.id]
                        ? 'border-green-500 shadow-green-200 bg-green-50'
                        : 'border-gray-100 hover:border-blue-300'
                      }`}
                    onClick={() => toggleTeacherSelection(subject.id)}
                  >
                    {/* Header with enhanced gradient */}
                    <div className={`p-6 text-white relative overflow-hidden ${selectedTeachers[subject.id]
                        ? 'bg-primary from-green-600 via-blue-600 to-purple-600'
                        : 'bg-primary from-blue-600 via-purple-600 to-indigo-600'
                      }`}>
                      <div className="absolute inset-0 bg-primary from-white/10 to-transparent"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold">{subject.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-bold border border-white/30 shadow-lg">
                              {subject.price} جنيه
                            </div>
                            {/* Checkbox indicator */}
                            <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${selectedTeachers[subject.id] ? 'bg-white' : 'bg-transparent'
                              }`}>
                              {selectedTeachers[subject.id] && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <BookOpen className="w-4 h-4 text-blue-200" />
                          <span className="text-blue-100 text-sm">مادة دراسية</span>
                        </div>
                      </div>
                    </div>

                    {/* Teacher Section */}
                    <div className="p-6">
                      {subject.teacher ? (
                        <div className="text-center">
                          <div className="relative mb-4">
                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                              {subject.teacher.photo ? (
                                <img
                                  src={subject.teacher.photo}
                                  alt={subject.teacher.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-white from-blue-500 to-purple-600 flex items-center justify-center">
                                  <User className="w-12 h-12 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <h5 className="font-bold text-gray-800 text-lg mb-2">{subject.teacher.name}</h5>
                          <p className="text-gray-600 text-sm">مدرس متخصص</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCheck className="w-10 h-10 text-gray-400" />
                          </div>
                          <h5 className="font-semibold text-gray-600 mb-2">لم يتم تعيين مدرس بعد</h5>
                          <p className="text-gray-500 text-sm">سيتم تعيين مدرس متخصص قريباً</p>
                        </div>
                      )}

                      {/* Selection status */}
                      <div className="mt-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${selectedTeachers[subject.id]
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {selectedTeachers[subject.id] ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              مختار
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                              انقر للاختيار
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing and Booking Section */}
              <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8 rounded-3xl border-2 border-green-200 shadow-xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-4">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">إجمالي الرسوم الشهرية</h3>
                  <p className="text-gray-600">
                    {getSelectedSubjectsCount() > 0
                      ? `للمواد المختارة (${getSelectedSubjectsCount()} من ${selectedGradeData.subjects.length})`
                      : 'اختر المواد التي تريد حجزها'
                    }
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="text-center lg:text-right">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {calculateSelectedTotalPrice()} جنيه
                    </div>
                    <div className="text-sm text-gray-600">
                      {getSelectedSubjectsCount() > 0
                        ? `شهرياً • ${getSelectedSubjectsCount()} مواد دراسية`
                        : 'لم يتم اختيار أي مواد بعد'
                      }
                    </div>
                    {getSelectedSubjectsCount() > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        تم اختيار {getSelectedSubjectsCount()} من {selectedGradeData.subjects.length} مواد
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={sendBookingMessage}
                      disabled={getSelectedSubjectsCount() === 0}
                      className={`group px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform flex items-center justify-center gap-3 ${getSelectedSubjectsCount() === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:scale-105 hover:shadow-2xl'
                        }`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      {getSelectedSubjectsCount() === 0
                        ? 'اختر مواد أولاً'
                        : `احجز المواد المختارة (${getSelectedSubjectsCount()})`
                      }
                    </button>

                    <button
                      onClick={sendWhatsAppMessage}
                      className="group bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:border-blue-300 flex items-center justify-center gap-3"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      استفسار عام
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>






      {/* Encouragement System Section */}
      <section className="py-16 px-4 bg-white from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            نظام التشجيع والمتابعة
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            نظام متطور لتحفيز الطلاب وتحقيق أفضل النتائج من خلال المتابعة المستمرة
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {encouragementSystem.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-100"
              >
                <div className="mb-4 flex justify-center">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 text-center">{item.title}</h3>
                <p className="text-gray-600 text-sm text-center leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Students Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            الطلاب المتميزون
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            طلابنا المتفوقون الحاصلون على أكثر من 1000 نقطة وشهادات التميز
          </p>
          {topStudents.length > 0 && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-4 bg-white from-yellow-50 to-orange-50 px-6 py-3 rounded-full border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">
                    {topStudents.length} طالب متميز
                  </span>
                </div>
                <div className="w-px h-6 bg-yellow-300"></div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-700">
                    {topStudents.reduce((total, student) => total + (student.certificates?.length || 0), 0)} شهادة
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {topStudents.length > 0 ? (
              topStudents.map((student, index) => (
                <div
                  key={index}
                  className="bg-white from-yellow-50 to-orange-50 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-yellow-200"
                >
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="relative mx-auto mb-2 sm:mb-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-primary from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg mx-auto">
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt={student.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 truncate">{student.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 truncate">{student.grade}</p>
                    <div className="flex items-center justify-center space-x-1 space-x-reverse">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm lg:text-base font-bold text-orange-600">{student.points} نقطة</span>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {student.certificates && student.certificates.length > 0 ? (
                      <>
                        <div className="flex items-center text-xs sm:text-sm mb-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-yellow-700 font-semibold">الشهادات الحاصل عليها:</span>
                        </div>
                        {student.certificates.map((certificate, idx) => (
                          <div key={idx} className="flex items-center text-xs sm:text-sm bg-yellow-50 rounded-lg p-2 border-r-4 border-yellow-400">
                            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mr-2 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{certificate}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex items-center text-xs sm:text-sm bg-gray-50 rounded-lg p-2 border-r-4 border-gray-300">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 truncate">شهادة التفوق العلمي</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">لا يوجد طلاب متميزون حالياً</h3>
                <p className="text-gray-500">كن أول طالب يحصل على أكثر من 1000 نقطة!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary from-blue-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{getStats().students}</div>
              <div className="text-sm sm:text-base lg:text-xl opacity-90">طالب متفوق</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{getStats().teachers}</div>
              <div className="text-sm sm:text-base lg:text-xl opacity-90">مدرس متخصص</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{getStats().successRate}</div>
              <div className="text-sm sm:text-base lg:text-xl opacity-90">معدل النجاح</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{getStats().yearsOfExcellence}</div>
              <div className="text-sm sm:text-base lg:text-xl opacity-90">سنوات من التميز</div>
            </div>
          </div>
        </div>
      </section>



      {/* Testimonials */}
      <section className="py-20 px-4 bg-white from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary from-yellow-400 to-orange-500 rounded-full mb-6">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-800 bg-primary from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              آراء طلابنا
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              استمع إلى تجارب طلابنا المتميزين وكيف ساعدهم مركزنا في تحقيق أحلامهم
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "أحمد محمد",
                grade: "الثانوية العامة",
                text: `بفضل ${getShortName()} تحسنت درجاتي بشكل كبير. المدرسون رائعون والشرح واضح جداً. نظام النقاط شجعني كثيراً وأشعر أنني أتقدم كل يوم.`,
                rating: 5,
                achievement: "حصل على 95% في الثانوية العامة",
                photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              },
              {
                name: "فاطمة علي",
                grade: "الصف الثاني الثانوي",
                text: "المركز ساعدني في فهم الرياضيات بطريقة سهلة وممتعة. أنصح كل الطلاب بالانضمام. المتابعة الشخصية ممتازة والجداول مرنة.",
                rating: 5,
                achievement: "أفضل طالبة في الرياضيات",
                photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
              },
              {
                name: "محمد أحمد",
                grade: "الصف الثالث الثانوي",
                text: "الجداول مرنة والمتابعة ممتازة. حققت أحلامي في دخول كلية الطب. نظام التشجيع رائع والمدرسون متخصصون جداً.",
                rating: 5,
                achievement: "تم قبوله في كلية الطب",
                photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              },
              {
                name: "سارة محمود",
                grade: "الصف الأول الثانوي",
                text: "أحب الطريقة التي يشرح بها المدرسون. المواد أصبحت سهلة ومفهومة. نظام النقاط يحفزني للدراسة أكثر.",
                rating: 5,
                achievement: "تحسن ملحوظ في جميع المواد",
                photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
              },
              {
                name: "علي حسن",
                grade: "الصف الثالث الإعدادي",
                text: "المركز غير حياتي الدراسية بالكامل. المدرسون ودودون والجو العام مريح. أنصح الجميع بالتجربة.",
                rating: 5,
                achievement: "أول طالب في الفصل",
                photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
              },
              {
                name: "نور الدين",
                grade: "الصف الثاني الثانوي",
                text: "بفضل المتابعة المستمرة والدعم النفسي، أصبحت أكثر ثقة في نفسي. النتائج تتحدث عن نفسها.",
                rating: 5,
                achievement: "تحسن 40% في الدرجات",
                photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                {/* Header with gradient */}
                <div className="bg-primary from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                          <img
                            src={testimonial.photo}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="w-full h-full bg-primary from-blue-400 to-purple-500 flex items-center justify-center hidden">
                            <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{testimonial.name}</h3>
                          <p className="text-blue-100 text-sm">{testimonial.grade}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-2xl text-gray-300 mb-2">"</div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {testimonial.text}
                    </p>
                    <div className="text-2xl text-gray-300 mt-2 text-right">"</div>
                  </div>


                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white from-yellow-50 to-orange-50 p-8 rounded-3xl border-2 border-yellow-200 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">كن أنت القصة التالية للنجاح!</h3>
              <p className="text-gray-600 mb-6">انضم إلى آلاف الطلاب الذين حققوا أحلامهم معنا</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="bg-primary from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <User className="w-5 h-5" />
                  سجل الآن
                </Link>
                <button
                  onClick={sendWhatsAppMessage}
                  className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  تواصل معنا
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-primary from-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            ابدأ رحلتك التعليمية اليوم
          </h2>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى آلاف الطلاب الذين حققوا أحلامهم معنا
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            سجل الآن
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;

