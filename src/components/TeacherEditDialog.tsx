import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  grade: number;
  subjects: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface TeacherEditDialogProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTeacher: Teacher) => void;
}

const availableSubjects = [
  "الرياضيات",
  "الفيزياء", 
  "الكيمياء",
  "الأحياء",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التاريخ",
  "الجغرافيا",
  "التربية الإسلامية",
  "الحاسوب"
];

export function TeacherEditDialog({ teacher, isOpen, onClose, onUpdate }: TeacherEditDialogProps) {
  const [editData, setEditData] = useState({
    full_name: teacher?.full_name || "",
    phone: teacher?.phone || "",
    grade: teacher?.grade || 5,
    subjects: teacher?.subjects || [],
    status: teacher?.status || "approved"
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setEditData({
        ...editData,
        subjects: [...editData.subjects, subject]
      });
    } else {
      setEditData({
        ...editData,
        subjects: editData.subjects.filter(s => s !== subject)
      });
    }
  };

  const updateTeacher = async () => {
    if (!teacher) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: editData.full_name,
          phone: editData.phone,
          grade: editData.grade,
          subjects: editData.subjects,
          status: editData.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", teacher.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      onClose();
      
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المعلم بنجاح",
      });

    } catch (error: any) {
      console.error("خطأ في تحديث المعلم:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث بيانات المعلم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المعلم</DialogTitle>
          <DialogDescription>
            تحديث بيانات المعلم {teacher.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">الاسم الكامل</Label>
              <Input
                id="edit-name"
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input
                id="edit-phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-grade">الصف</Label>
              <Select value={editData.grade.toString()} onValueChange={(value) => setEditData({ ...editData, grade: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 5).map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      الصف {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">الحالة</Label>
              <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">مفعل</SelectItem>
                  <SelectItem value="pending">معطل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>المواد التي يُدرِّسها</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {availableSubjects.map((subject) => (
                <div key={subject} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`edit-${subject}`}
                    checked={editData.subjects.includes(subject)}
                    onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                  />
                  <Label htmlFor={`edit-${subject}`} className="text-sm">{subject}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={updateTeacher} disabled={loading}>
              {loading ? "جاري التحديث..." : "حفظ التغييرات"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}