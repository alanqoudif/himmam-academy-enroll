import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check, Star } from "lucide-react";
import Header from "@/components/Header";

const Pricing = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      title: "الصفوف 5-8",
      subtitle: "المرحلة الأساسية",
      price: "5",
      currency: "ر.ع",
      period: "للمادة الواحدة",
      color: "academy-orange",
      gradient: "gradient-primary",
      features: [
        "دعم غير محدود",
        "تسجيلات الحصص",
        "مراجعات نهائية", 
        "خصم طلاب الضمان",
        "واجبات تفاعلية",
        "تقارير تقدم شهرية"
      ],
      popular: false
    },
    {
      title: "الصف التاسع",
      subtitle: "التأسيس للمرحلة الثانوية",
      price: "5",
      currency: "ر.ع",
      period: "للمادة الواحدة",
      color: "academy-red",
      gradient: "gradient-secondary",
      features: [
        "جميع مميزات المرحلة الأساسية",
        "جلسات مراجعة إضافية",
        "امتحانات تجريبية",
        "استشارات أكاديمية",
        "دعم فوري للأسئلة",
        "خطة دراسة مخصصة"
      ],
      popular: true
    },
    {
      title: "الصفوف 10-12",
      subtitle: "المرحلة الثانوية",
      price: "10",
      currency: "ر.ع",
      period: "للمادة الواحدة",
      color: "academy-purple",
      gradient: "gradient-primary",
      features: [
        "جميع المميزات السابقة",
        "تحضير للامتحانات النهائية",
        "ورش عمل متقدمة",
        "استشارات جامعية",
        "دعم لاختيار التخصص",
        "ضمان النجاح"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-accent font-arabic" dir="rtl">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            خطط مرنة ومناسبة للجميع
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-6">
            خطط الأسعار
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            اختر الخطة المناسبة لمرحلتك الدراسية واستمتع بتجربة تعليمية متميزة مع أفضل المعلمين
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative shadow-medium border-0 overflow-hidden transition-all duration-300 hover:shadow-strong hover:scale-105 ${
                plan.popular ? 'ring-2 ring-academy-red' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 left-4 bg-academy-red text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  الأكثر شعبية
                </div>
              )}
              
              <div className={`absolute top-0 left-0 right-0 h-2 bg-${plan.gradient}`}></div>
              
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl text-accent mb-2">{plan.title}</CardTitle>
                <p className="text-muted-foreground text-sm mb-4">{plan.subtitle}</p>
                <div className="flex items-baseline justify-center">
                  <span className={`text-5xl font-bold text-${plan.color}`}>{plan.price}</span>
                  <span className={`text-lg text-${plan.color} mr-2`}>{plan.currency}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{plan.period}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <div className={`w-5 h-5 bg-${plan.color}/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                        <Check className={`w-3 h-3 text-${plan.color}`} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => navigate('/enroll')}
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:opacity-90 text-white' 
                      : 'bg-accent hover:bg-accent/90 text-white'
                  }`}
                  size="lg"
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  اشترك الآن
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-medium max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-accent mb-4">لماذا تختار أكاديمية همم؟</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-academy-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-academy-orange" />
              </div>
              <h4 className="font-semibold text-accent mb-2">ضمان الجودة</h4>
              <p className="text-muted-foreground text-sm">نضمن لك أعلى مستوى من التعليم مع إمكانية استرداد الرسوم</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-academy-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-academy-red" />
              </div>
              <h4 className="font-semibold text-accent mb-2">معلمون متميزون</h4>
              <p className="text-muted-foreground text-sm">فريق من أفضل المعلمين المؤهلين في المنطقة</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-academy-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-academy-purple" />
              </div>
              <h4 className="font-semibold text-accent mb-2">مناهج حديثة</h4>
              <p className="text-muted-foreground text-sm">مناهج محدثة تواكب أحدث التطورات التعليمية</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;