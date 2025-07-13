import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, DollarSign, GraduationCap, BookOpen, FileText, CreditCard } from "lucide-react";

interface Subject {
  id: string;
  subject_name: string;
  grade: number;
  price_per_subject: number;
}

interface BankTransferInfo {
  bank_name: string;
  account_number: string;
  account_name: string;
  iban: string;
  branch_name: string;
}

export default function EnrollmentForm() {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    transferDetails: ""
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const grades = [5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    fetchBankInfo();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchSubjectsForGrade(selectedGrade);
    }
  }, [selectedGrade]);

  const fetchBankInfo = async () => {
    const { data, error } = await supabase
      .from('bank_transfer_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching bank info:', error);
    } else {
      setBankInfo(data);
    }
  };

  const fetchSubjectsForGrade = async (grade: number) => {
    const { data, error } = await supabase
      .from('subjects_pricing')
      .select('*')
      .eq('grade', grade)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المواد",
        variant: "destructive"
      });
    } else {
      setAvailableSubjects(data || []);
      setSelectedSubjects([]);
    }
  };

  const calculateTotal = () => {
    return availableSubjects
      .filter(subject => selectedSubjects.includes(subject.subject_name))
      .reduce((total, subject) => total + subject.price_per_subject, 0);
  };

  const handleSubjectChange = (subjectName: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectName]);
    } else {
      setSelectedSubjects(selectedSubjects.filter(name => name !== subjectName));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ",
          description: "حجم الملف كبير جداً (الحد الأقصى 5 ميغابايت)",
          variant: "destructive"
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const uploadReceipt = async (file: File) => {
    const fileName = `receipt_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const sendWhatsAppNotification = async (type: 'student' | 'admin', message: string, studentName?: string, phoneNumber?: string) => {
    try {
      await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          message,
          recipient_type: type,
          student_name: studentName,
          phone_number: phoneNumber,
          admin_phone: phoneNumber // استخدام الرقم الممرر
        }
      });
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGrade || selectedSubjects.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الصف والمواد",
        variant: "destructive"
      });
      return;
    }

    if (!receiptFile) {
      toast({
        title: "خطأ",
        description: "يرجى رفع إيصال التحويل",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // رفع إيصال التحويل
      console.log('Starting file upload...');
      const receiptUrl = await uploadReceipt(receiptFile);
      console.log('File uploaded successfully:', receiptUrl);

      // إنشاء التسجيل
      const enrollmentData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        grade: selectedGrade,
        selected_subjects: selectedSubjects,
        total_amount: calculateTotal(),
        receipt_url: receiptUrl,
        bank_transfer_details: formData.transferDetails,
        status: 'pending'
      };

      console.log('Creating enrollment with data:', enrollmentData);

      const { data: enrollmentResult, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .insert([enrollmentData])
        .select()
        .single();

      if (enrollmentError) {
        console.error('Database insertion error:', enrollmentError);
        throw new Error(`خطأ في قاعدة البيانات: ${enrollmentError.message}`);
      }

      console.log('Enrollment created successfully:', enrollmentResult);

      // إرسال إشعارات الواتساب
      console.log('Sending WhatsApp notifications...');
      try {
        // الحصول على رقم الأدمن من قاعدة البيانات
        const { data: adminSettings } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'admin_phone')
          .single();

        const adminPhone = adminSettings?.setting_value || "96871234567";

        await Promise.all([
          sendWhatsAppNotification(
            'student',
            'تم استلام طلب التسجيل الخاص بك في أكاديمية همم التعليمية. سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.',
            formData.fullName,
            formData.phone
          ),
          sendWhatsAppNotification(
            'admin',
            `📚 طلب تسجيل جديد في أكاديمية همم\n\nاسم الطالب: ${formData.fullName}\nالإيميل: ${formData.email}\nالهاتف: ${formData.phone}\nالصف: ${selectedGrade}\nالمواد المختارة: ${selectedSubjects.join(', ')}\nإجمالي المبلغ: ${calculateTotal()} ريال عماني\n\nيرجى مراجعة الطلب في لوحة التحكم.`,
            formData.fullName,
            adminPhone
          )
        ]);
        console.log('WhatsApp notifications sent successfully');
      } catch (whatsappError) {
        console.warn('WhatsApp notifications failed:', whatsappError);
        // لا نوقف العملية إذا فشل الواتساب
      }

      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال طلب التسجيل، سيتم التواصل معك قريباً"
      });

      // إعادة تعيين النموذج
      setFormData({ fullName: "", email: "", phone: "", transferDetails: "" });
      setSelectedGrade(null);
      setSelectedSubjects([]);
      setReceiptFile(null);

    } catch (error) {
      console.error('Full error details:', error);
      
      let errorMessage = "حدث خطأ أثناء إرسال الطلب";
      
      if (error instanceof Error) {
        if (error.message.includes('قاعدة البيانات')) {
          errorMessage = error.message;
        } else if (error.message.includes('storage')) {
          errorMessage = "خطأ في رفع الملف، تأكد من حجم الملف وصيغته";
        } else if (error.message.includes('network')) {
          errorMessage = "خطأ في الاتصال، تأكد من الإنترنت";
        } else {
          errorMessage = `خطأ: ${error.message}`;
        }
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-accent font-arabic" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 shadow-soft">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-4">
            أكاديمية همم التعليمية
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            انضم إلينا في رحلة التعلم والتميز الأكاديمي
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* النموذج الرئيسي */}
          <Card className="shadow-medium border-0">
            <CardHeader className="bg-gradient-primary text-white">
              <CardTitle className="text-center text-2xl">
                <BookOpen className="w-6 h-6 inline-block mr-2" />
                نموذج التسجيل
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* البيانات الشخصية */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-accent">البيانات الشخصية</h3>
                  
                  <div>
                    <Label htmlFor="fullName">الاسم الكامل *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="96812345678"
                    />
                  </div>
                </div>

                {/* اختيار الصف والمواد */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-accent">اختيار الصف والمواد</h3>
                  
                  <div>
                    <Label>الصف الدراسي *</Label>
                    <Select onValueChange={(value) => setSelectedGrade(parseInt(value))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>
                            الصف {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedGrade && availableSubjects.length > 0 && (
                    <div>
                      <Label>المواد المطلوبة *</Label>
                      <div className="mt-2 space-y-3 max-h-48 overflow-y-auto">
                        {availableSubjects.map(subject => (
                          <div key={subject.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={subject.id}
                                checked={selectedSubjects.includes(subject.subject_name)}
                                onCheckedChange={(checked) => 
                                  handleSubjectChange(subject.subject_name, checked as boolean)
                                }
                              />
                              <Label htmlFor={subject.id} className="cursor-pointer">
                                {subject.subject_name}
                              </Label>
                            </div>
                            <span className="text-sm font-medium text-primary">
                              {subject.price_per_subject} ر.ع
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSubjects.length > 0 && (
                    <div className="bg-academy-light p-4 rounded-lg border-r-4 border-academy-orange">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">إجمالي المبلغ:</span>
                        <span className="text-2xl font-bold text-academy-orange">
                          <DollarSign className="w-5 h-5 inline-block" />
                          {calculateTotal()} ريال عماني
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* تفاصيل التحويل */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-accent">تفاصيل التحويل</h3>
                  
                  <div>
                    <Label htmlFor="transferDetails">تفاصيل التحويل (اختياري)</Label>
                    <Textarea
                      id="transferDetails"
                      value={formData.transferDetails}
                      onChange={(e) => setFormData({...formData, transferDetails: e.target.value})}
                      className="mt-1"
                      rows={3}
                      placeholder="أضف أي تفاصيل إضافية حول التحويل..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="receipt">إيصال التحويل *</Label>
                    <div className="mt-1">
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        required
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                      />
                      {receiptFile && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <FileText className="w-4 h-4 inline-block mr-1" />
                          {receiptFile.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        يُقبل ملفات الصور و PDF بحد أقصى 5 ميغابايت
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || selectedSubjects.length === 0}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 text-lg shadow-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Upload className="w-5 h-5 mr-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      إرسال طلب التسجيل
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* معلومات التحويل البنكي */}
          {bankInfo && (
            <Card className="shadow-medium border-0">
              <CardHeader className="bg-gradient-secondary text-white">
                <CardTitle className="text-center text-2xl">
                  <CreditCard className="w-6 h-6 inline-block mr-2" />
                  بيانات التحويل البنكي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-academy-light p-4 rounded-lg">
                    <h4 className="font-semibold text-accent mb-3">تفاصيل الحساب البنكي:</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">اسم البنك:</span> {bankInfo.bank_name}
                      </div>
                      <div>
                        <span className="font-medium">رقم الحساب:</span> {bankInfo.account_number}
                      </div>
                      <div>
                        <span className="font-medium">اسم الحساب:</span> {bankInfo.account_name}
                      </div>
                      {bankInfo.iban && (
                        <div>
                          <span className="font-medium">IBAN:</span> {bankInfo.iban}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">الفرع:</span> {bankInfo.branch_name}
                      </div>
                    </div>
                  </div>

                  <div className="bg-academy-red/10 border border-academy-red/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-academy-red mb-2">تعليمات مهمة:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• قم بالتحويل بالمبلغ المطلوب بالضبط</li>
                      <li>• احتفظ بإيصال التحويل وارفعه في النموذج</li>
                      <li>• ستتم مراجعة طلبك خلال 24 ساعة</li>
                      <li>• سيتم إرسال تأكيد التسجيل عبر الواتساب</li>
                    </ul>
                  </div>

                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}