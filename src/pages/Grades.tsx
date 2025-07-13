import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Award, Target, TrendingUp } from "lucide-react";
import Header from "@/components/Header";

const Grades = () => {
  const navigate = useNavigate();

  const gradeGroups = [
    {
      id: "elementary",
      title: "الصفوف 5-8",
      subtitle: "المرحلة الأساسية",
      description: "بناء أساس قوي للطلاب في المواد الأساسية مع التركيز على تطوير المهارات الأساسية",
      price: "5 ر.ع",
      color: "academy-orange",
      gradient: "gradient-primary",
      subjects: [
        "الرياضيات",
        "العلوم",
        "اللغة العربية",
        "اللغة الإنجليزية",
        "الدراسات الاجتماعية",
        "التربية الإسلامية"
      ],
      features: [
        "تعلم تفاعلي ومرح",
        "تقوية المهارات الأساسية", 
        "واجبات منزلية مدعومة",
        "مراجعات دورية",
        "تقارير تقدم للأهل"
      ],
      stats: {
        students: "500+",
        hours: "2000+",
        success: "95%"
      }
    },
    {
      id: "grade9",
      title: "الصف التاسع",
      subtitle: "التأسيس للمرحلة الثانوية",
      description: "مرحلة انتقالية مهمة تهيئ الطلاب للمرحلة الثانوية مع التركيز على التفكير النقدي",
      price: "5 ر.ع",
      color: "academy-red",
      gradient: "gradient-secondary", 
      subjects: [
        "الرياضيات المتقدمة",
        "الفيزياء",
        "الكيمياء",
        "الأحياء",
        "اللغة العربية",
        "اللغة الإنجليزية"
      ],
      features: [
        "تحضير للمرحلة الثانوية",
        "تطوير مهارات التفكير النقدي",
        "امتحانات تجريبية منتظمة",
        "جلسات مراجعة مكثفة",
        "دعم نفسي وأكاديمي"
      ],
      stats: {
        students: "300+",
        hours: "1500+",
        success: "97%"
      }
    },
    {
      id: "secondary",
      title: "الصفوف 10-12",
      subtitle: "المرحلة الثانوية",
      description: "الإعداد النهائي للامتحانات الثانوية والقبول الجامعي مع التخصص في المواد المختارة",
      price: "10 ر.ع",
      color: "academy-purple",
      gradient: "gradient-primary",
      subjects: [
        "الرياضيات البحتة",
        "الرياضيات التطبيقية", 
        "الفيزياء",
        "الكيمياء",
        "الأحياء",
        "علوم الحاسوب",
        "اللغة العربية",
        "اللغة الإنجليزية"
      ],
      features: [
        "تحضير شامل للدبلوم",
        "استراتيجيات امتحانات متقدمة",
        "ورش عمل للمواد الصعبة",
        "استشارات اختيار التخصص",
        "دعم القبول الجامعي"
      ],
      stats: {
        students: "400+",
        hours: "3000+",
        success: "98%"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-accent font-arabic" dir="rtl">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            تعليم متدرج ومخصص لكل مرحلة
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-6">
            الصفوف والمراحل الدراسية
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            نقدم برامج تعليمية مخصصة لكل مرحلة دراسية، مصممة لتلبية احتياجات الطلاب وتطوير قدراتهم الأكاديمية
          </p>
        </div>

        {/* Grade Groups */}
        <div className="space-y-16">
          {gradeGroups.map((group, index) => (
            <div key={group.id} id={group.id} className="scroll-mt-20">
              <Card className="shadow-strong border-0 overflow-hidden">
                <div className={`h-2 bg-${group.gradient}`}></div>
                
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Content */}
                    <div>
                      <div className="flex items-center mb-4">
                        <h2 className="text-3xl font-bold text-accent ml-4">{group.title}</h2>
                        <Badge variant="secondary" className={`bg-${group.color}/10 text-${group.color} border-${group.color}/20`}>
                          {group.price}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-lg mb-6">{group.subtitle}</p>
                      <p className="text-foreground mb-8">{group.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center">
                          <div className={`text-2xl font-bold text-${group.color}`}>{group.stats.students}</div>
                          <div className="text-sm text-muted-foreground">طالب</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold text-${group.color}`}>{group.stats.hours}</div>
                          <div className="text-sm text-muted-foreground">ساعة تدريس</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold text-${group.color}`}>{group.stats.success}</div>
                          <div className="text-sm text-muted-foreground">نسبة النجاح</div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate('/enroll')}
                        size="lg"
                        className={`bg-${group.color} hover:opacity-90 text-white`}
                      >
                        <BookOpen className="w-5 h-5 ml-2" />
                        سجل في هذه المرحلة
                      </Button>
                    </div>

                    {/* Subjects & Features */}
                    <div className="space-y-6">
                      {/* Subjects */}
                      <div>
                        <h3 className="text-xl font-semibold text-accent mb-4 flex items-center">
                          <BookOpen className="w-5 h-5 ml-2" />
                          المواد المتاحة
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {group.subjects.map((subject, subjectIndex) => (
                            <Badge 
                              key={subjectIndex} 
                              variant="outline" 
                              className="justify-start p-2 text-sm"
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className="text-xl font-semibold text-accent mb-4 flex items-center">
                          <Award className="w-5 h-5 ml-2" />
                          الميزات المتاحة
                        </h3>
                        <div className="space-y-3">
                          {group.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center">
                              <div className={`w-2 h-2 bg-${group.color} rounded-full mr-3`}></div>
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-primary text-white border-0 shadow-strong p-8">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">هل تريد معرفة المزيد؟</CardTitle>
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                تواصل معنا للحصول على استشارة مجانية حول أفضل برنامج تعليمي يناسب مرحلتك الدراسية
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/contact')}
                  variant="secondary"
                  size="lg"
                  className="bg-white text-academy-orange hover:bg-white/90"
                >
                  <Users className="w-5 h-5 ml-2" />
                  اتصل بنا
                </Button>
                <Button 
                  onClick={() => navigate('/enroll')}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-academy-orange"
                >
                  <BookOpen className="w-5 h-5 ml-2" />
                  سجل الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Grades;