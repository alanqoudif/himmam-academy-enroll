import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogIn, User, Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username || !password) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال اسم المستخدم وكلمة المرور",
          variant: "destructive",
        });
        return;
      }

      // التحقق من بيانات الاعتماد
      const { data, error } = await supabase
        .rpc('verify_user_credentials', {
          input_username: username,
          input_password: password
        });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
        return;
      }

      const userData = data[0];
      const profileData = userData.profile_data as any;

      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem('user_session', JSON.stringify({
        user_id: userData.user_id,
        profile: profileData
      }));

      toast({
        title: "مرحباً بك",
        description: `تم تسجيل الدخول بنجاح، ${profileData.full_name}`,
      });

      // توجيه المستخدم حسب دوره
      if (profileData.role === 'admin') {
        navigate('/admin');
      } else if (profileData.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (profileData.role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تسجيل الدخول",
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
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل اسم المستخدم وكلمة المرور للدخول إلى المنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">بيانات تجريبية للاختبار:</h3>
            <div className="text-sm space-y-1">
              <div><strong>معلم:</strong> teacher001 / Teacher123!</div>
              <div><strong>طالب:</strong> student001 / Student123!</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}