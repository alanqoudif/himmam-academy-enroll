import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول",
          variant: "destructive",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "خطأ",
          description: "كلمة المرور الجديدة وتأكيدها غير متطابقتين",
          variant: "destructive",
        });
        return;
      }

      if (newPassword.length < 8) {
        toast({
          title: "خطأ",
          description: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
          variant: "destructive",
        });
        return;
      }

      // الحصول على بيانات المستخدم الحالي
      const userSession = localStorage.getItem('user_session');
      if (!userSession) {
        navigate('/login');
        return;
      }

      const sessionData = JSON.parse(userSession);
      
      // التحقق من كلمة المرور الحالية
      const { data: verifyData, error: verifyError } = await supabase
        .rpc('verify_user_credentials', {
          input_username: sessionData.profile.full_name, // مؤقتاً نستخدم الاسم
          input_password: currentPassword
        });

      if (verifyError || !verifyData || verifyData.length === 0) {
        toast({
          title: "خطأ",
          description: "كلمة المرور الحالية غير صحيحة",
          variant: "destructive",
        });
        return;
      }

      // تحديث كلمة المرور
      const { error: updateError } = await supabase
        .from('user_credentials')
        .update({ password_hash: newPassword })
        .eq('user_id', sessionData.user_id);

      if (updateError) throw updateError;

      toast({
        title: "تم بنجاح",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      // العودة للصفحة السابقة
      navigate(-1);

    } catch (error) {
      console.error("خطأ في تغيير كلمة المرور:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">تغيير كلمة المرور</CardTitle>
          <CardDescription>
            قم بإدخال كلمة المرور الحالية والجديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                dir="ltr"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading}
              >
                {loading ? "جاري التحديث..." : "تغيير كلمة المرور"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}