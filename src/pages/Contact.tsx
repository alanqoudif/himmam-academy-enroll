import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  CheckCircle
} from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: "الهاتف",
      details: ["+968 9123 4567", "+968 2456 7890"],
      color: "academy-orange"
    },
    {
      icon: Mail,
      title: "البريد الإلكتروني", 
      details: ["info@hemma-academy.com", "support@hemma-academy.com"],
      color: "academy-red"
    },
    {
      icon: MapPin,
      title: "العنوان",
      details: ["مسقط، سلطنة عمان", "المركز الرئيسي - الخوير"],
      color: "academy-purple"
    },
    {
      icon: Clock,
      title: "ساعات العمل",
      details: ["السبت - الخميس: 8:00 ص - 8:00 م", "الجمعة: مغلق"],
      color: "academy-orange"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "تم إرسال رسالتك بنجاح",
        description: "سنتواصل معك في أقرب وقت ممكن",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-accent font-arabic" dir="rtl">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            نحن هنا لمساعدتك
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-6">
            اتصل بنا
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            لديك سؤال أو تحتاج مساعدة؟ تواصل معنا وسنكون سعداء بمساعدتك في رحلتك التعليمية
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-strong border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-accent flex items-center">
                <MessageSquare className="w-6 h-6 ml-3" />
                أرسل لنا رسالة
              </CardTitle>
              <p className="text-muted-foreground">
                املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-accent mb-2 block">
                      الاسم الكامل *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="اكتب اسمك الكامل"
                      required
                      className="text-right"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-accent mb-2 block">
                      رقم الهاتف *
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+968 9123 4567"
                      required
                      className="text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-accent mb-2 block">
                    البريد الإلكتروني *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    className="text-right"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-accent mb-2 block">
                    موضوع الرسالة *
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="ما موضوع رسالتك؟"
                    required
                    className="text-right"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-accent mb-2 block">
                    الرسالة *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="اكتب رسالتك هنا..."
                    rows={5}
                    required
                    className="text-right resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                      جارٍ الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 ml-2" />
                      إرسال الرسالة
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-strong border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-accent">معلومات التواصل</CardTitle>
                <p className="text-muted-foreground">
                  يمكنك التواصل معنا عبر أي من الوسائل التالية
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4 space-x-reverse">
                    <div className={`w-12 h-12 bg-${info.color}/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <info.icon className={`w-6 h-6 text-${info.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-accent mb-2">{info.title}</h3>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-muted-foreground text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="shadow-strong border-0 bg-gradient-primary text-white">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-4">تواصل سريع</h3>
                <p className="text-white/90 mb-6">
                  تحتاج إجابة فورية؟ اتصل بنا مباشرة
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full bg-white text-academy-orange hover:bg-white/90"
                    onClick={() => window.open('tel:+96891234567')}
                  >
                    <Phone className="w-4 h-4 ml-2" />
                    اتصل الآن: +968 9123 4567
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full border-white text-white hover:bg-white hover:text-academy-orange"
                    onClick={() => window.open('mailto:info@hemma-academy.com')}
                  >
                    <Mail className="w-4 h-4 ml-2" />
                    أرسل إيميل
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="text-xl text-accent">أسئلة شائعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "كيف يمكنني التسجيل؟",
                  "ما هي طرق الدفع المتاحة؟",
                  "هل يوجد خصومات للطلاب؟",
                  "كيف يمكنني الوصول للدروس؟"
                ].map((question, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                    <p className="text-sm text-accent">{question}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;