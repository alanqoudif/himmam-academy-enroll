import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Award, Target, Heart, BookOpen, Star, TrendingUp, Shield, Clock } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
const About = () => {
  const navigate = useNavigate();
  const values = [{
    icon: Target,
    title: "الرؤية",
    description: "أن نكون المنصة التعليمية الرائدة في المنطقة التي تمكن الطلاب من تحقيق أهدافهم الأكاديمية"
  }, {
    icon: Heart,
    title: "الرسالة",
    description: "تقديم تعليم عالي الجودة يبني قدرات الطلاب ويطور مهاراتهم بأساليب تعليمية حديثة ومبتكرة"
  }, {
    icon: Award,
    title: "القيم",
    description: "الجودة، التميز، الابتكار، والالتزام بتحقيق أفضل النتائج التعليمية لجميع طلابنا"
  }];
  const features = [{
    icon: Users,
    title: "معلمون خبراء",
    description: "فريق من أفضل المعلمين المؤهلين والمتخصصين في مجالاتهم",
    color: "academy-orange"
  }, {
    icon: BookOpen,
    title: "مناهج حديثة",
    description: "مناهج محدثة تواكب أحدث التطورات في التعليم والتكنولوجيا",
    color: "academy-red"
  }, {
    icon: Star,
    title: "نتائج مضمونة",
    description: "نسبة نجاح عالية تصل إلى 98% في جميع المراحل الدراسية",
    color: "academy-purple"
  }, {
    icon: TrendingUp,
    title: "تطوير مستمر",
    description: "تحسين مستمر للبرامج والأساليب التعليمية بناءً على أحدث الأبحاث",
    color: "academy-orange"
  }, {
    icon: Shield,
    title: "بيئة آمنة",
    description: "بيئة تعليمية آمنة ومحفزة تشجع الطلاب على التعلم والإبداع",
    color: "academy-red"
  }, {
    icon: Clock,
    title: "مرونة في التوقيت",
    description: "جداول مرنة تناسب ظروف الطلاب وأولياء الأمور",
    color: "academy-purple"
  }];
  const stats = [{
    number: "1200+",
    label: "طالب متفوق",
    color: "academy-orange"
  }, {
    number: "50+",
    label: "معلم متخصص",
    color: "academy-red"
  }, {
    number: "98%",
    label: "نسبة النجاح",
    color: "academy-purple"
  }, {
    number: "5+",
    label: "سنوات من التميز",
    color: "academy-orange"
  }];
  return <div className="min-h-screen bg-gradient-accent font-arabic" dir="rtl">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            من نحن
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-6">
            أكاديمية همم التعليمية
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            منصة تعليمية رائدة تهدف إلى تطوير قدرات الطلاب وتحقيق التفوق الأكاديمي من خلال أساليب تعليمية حديثة ومبتكرة
          </p>
          
          <div className="flex justify-center mb-12">
            <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center shadow-strong">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => <Card key={index} className="text-center shadow-medium border-0 hover:shadow-strong transition-shadow">
              <CardContent className="p-6">
                <div className={`text-3xl md:text-4xl font-bold text-${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </CardContent>
            </Card>)}
        </div>

        {/* Vision, Mission, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => <Card key={index} className="shadow-medium border-0 hover:shadow-strong transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-academy-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-academy-orange" />
                </div>
                <CardTitle className="text-xl text-accent">{value.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>)}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-accent text-center mb-12">لماذا تختار أكاديمية همم؟</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="shadow-medium border-0 hover:shadow-strong transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-${feature.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg text-accent">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Our Story */}
        <Card className="shadow-strong border-0 mb-16">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-accent mb-6">قصتنا</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    بدأت أكاديمية همم التعليمية من رؤية بسيطة: تقديم تعليم عالي الجودة يمكن الوصول إليه لجميع الطلاب. 
                    منذ تأسيسنا، ونحن نسعى لتطوير أساليب تعليمية مبتكرة تلبي احتياجات الطلاب في العصر الحديث.
                  </p>
                  <p>
                    اليوم، نفخر بخدمة أكثر من 1200 طالب عبر جميع المراحل الدراسية، بدعم من فريق من أفضل المعلمين 
                    المتخصصين الذين يؤمنون برسالتنا في تحقيق التميز الأكاديمي.
                  </p>
                  <p>
                    نستمر في رحلتنا لنكون المنصة التعليمية الرائدة التي تمكن كل طالب من تحقيق إمكاناته الكاملة 
                    والوصول إلى أهدافه الأكاديمية والمهنية.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-primary rounded-2xl p-6 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">رحلة التميز</h3>
                  <p className="text-white/90">5 سنوات من الإنجازات والنجاحات</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-academy-orange/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-academy-orange">2019</div>
                    <div className="text-sm text-muted-foreground">بداية المشوار</div>
                  </div>
                  <div className="bg-academy-red/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-academy-red">2024</div>
                    <div className="text-sm text-muted-foreground">الريادة والتميز</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-primary text-white border-0 shadow-strong p-8">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">انضم إلى عائلة همم</CardTitle>
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                ابدأ رحلتك التعليمية معنا اليوم وكن جزءاً من قصص النجاح التي نفخر بها
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/enroll')} variant="secondary" size="lg" className="bg-white text-academy-orange hover:bg-white/90">
                  <BookOpen className="w-5 h-5 ml-2" />
                  سجل الآن
                </Button>
                <Button onClick={() => navigate('/contact')} variant="outline" size="lg" className="border-white text-slate-950 bg-slate-300 hover:bg-slate-200">
                  <Users className="w-5 h-5 ml-2" />
                  تواصل معنا
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default About;