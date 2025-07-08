import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Award, ArrowLeft } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-accent font-arabic" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-full mb-6 shadow-strong">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-accent mb-4">
            أكاديمية همم التعليمية
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            منصة تعليمية متميزة تهدف إلى تطوير قدرات الطلاب وتحقيق التفوق الأكاديمي من خلال أساليب تعليمية حديثة ومبتكرة
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate('/enroll')}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-medium"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              سجل الآن
            </Button>
            
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-medium border-0 hover:shadow-strong transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-academy-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-academy-orange" />
              </div>
              <CardTitle className="text-xl text-accent">مناهج شاملة</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                مناهج تعليمية شاملة تغطي جميع المراحل الدراسية من الصف الخامس إلى الثاني عشر
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0 hover:shadow-strong transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-academy-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-academy-red" />
              </div>
              <CardTitle className="text-xl text-accent">معلمون خبراء</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                فريق من المعلمين المؤهلين والخبراء في مجالاتهم لضمان أفضل تجربة تعليمية
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0 hover:shadow-strong transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-academy-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-academy-purple" />
              </div>
              <CardTitle className="text-xl text-accent">تميز أكاديمي</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                برامج تعليمية متطورة تهدف إلى تحقيق أعلى مستويات التحصيل الأكاديمي
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-accent mb-8">خطط الأسعار</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-medium border-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-primary"></div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl text-accent">الصفوف 5-8</CardTitle>
                <div className="text-4xl font-bold text-academy-orange my-4">5 ر.ع</div>
                <p className="text-muted-foreground">للمادة الواحدة</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-orange rounded-full mr-3"></div>
                  <span>دعم غير محدود</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-orange rounded-full mr-3"></div>
                  <span>تسجيلات الحصص</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-orange rounded-full mr-3"></div>
                  <span>مراجعات نهائية</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-orange rounded-full mr-3"></div>
                  <span>خصم طلاب الضمان</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium border-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-secondary"></div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl text-accent">الصف التاسع</CardTitle>
                <div className="text-4xl font-bold text-academy-red my-4">5 ر.ع</div>
                <p className="text-muted-foreground">للمادة الواحدة</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-red rounded-full mr-3"></div>
                  <span>دعم غير محدود</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-red rounded-full mr-3"></div>
                  <span>تسجيلات الحصص</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-red rounded-full mr-3"></div>
                  <span>مراجعات نهائية</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-red rounded-full mr-3"></div>
                  <span>خصم طلاب الضمان</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium border-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-primary"></div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl text-accent">الصفوف 10-12</CardTitle>
                <div className="text-4xl font-bold text-academy-purple my-4">10 ر.ع</div>
                <p className="text-muted-foreground">للمادة الواحدة</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-purple rounded-full mr-3"></div>
                  <span>دعم غير محدود</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-purple rounded-full mr-3"></div>
                  <span>تسجيلات الحصص</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-purple rounded-full mr-3"></div>
                  <span>مراجعات نهائية</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-academy-purple rounded-full mr-3"></div>
                  <span>خصم طلاب الضمان</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-primary rounded-2xl p-12 shadow-strong">
          <h2 className="text-3xl font-bold text-white mb-4">ابدأ رحلتك التعليمية الآن</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف الطلاب الذين اختاروا أكاديمية همم لتحقيق أهدافهم الأكاديمية
          </p>
          <Button 
            onClick={() => navigate('/enroll')}
            size="lg"
            variant="secondary"
            className="bg-white text-academy-orange hover:bg-white/90 font-semibold px-8 py-4 text-lg shadow-medium"
          >
            <BookOpen className="w-6 h-6 mr-2" />
            سجل الآن واحصل على خصم خاص
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
