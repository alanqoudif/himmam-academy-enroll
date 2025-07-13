import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { GraduationCap, Menu, X, BookOpen, Users, DollarSign, Info, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { title: "الرئيسية", href: "/", icon: Home },
    { title: "الأسعار", href: "/pricing", icon: DollarSign },
    { title: "الصفوف", href: "/grades", icon: BookOpen },
    { title: "من نحن", href: "/about", icon: Info },
    { title: "اتصل بنا", href: "/contact", icon: Users },
  ];

  const gradeItems = [
    { title: "الصفوف 5-8", description: "المرحلة الأساسية", href: "/grades#elementary" },
    { title: "الصف التاسع", description: "التأسيس للمرحلة الثانوية", href: "/grades#grade9" },
    { title: "الصفوف 10-12", description: "المرحلة الثانوية", href: "/grades#secondary" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" dir="rtl">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 space-x-reverse mr-6">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-accent">أكاديمية همم</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link 
                  to="/" 
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  <Home className="w-4 h-4 ml-2" />
                  الرئيسية
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link 
                  to="/pricing" 
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  <DollarSign className="w-4 h-4 ml-2" />
                  الأسعار
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <BookOpen className="w-4 h-4 ml-2" />
                الصفوف
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {gradeItems.map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link 
                  to="/about" 
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  <Info className="w-4 h-4 ml-2" />
                  من نحن
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link 
                  to="/contact" 
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  <Users className="w-4 h-4 ml-2" />
                  اتصل بنا
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Button */}
        <div className="flex items-center space-x-2 space-x-reverse mr-auto">
          <Button 
            onClick={() => navigate('/enroll')}
            className="bg-gradient-primary hover:opacity-90 text-white font-medium hidden sm:flex"
          >
            <BookOpen className="w-4 h-4 ml-2" />
            سجل الآن
          </Button>
          
          <Button 
            onClick={() => navigate('/admin')}
            variant="outline"
            className="hidden sm:flex"
          >
            لوحة التحكم
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container px-4 py-4 space-y-3">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            ))}
            <div className="border-t border-border pt-3 space-y-2">
              <Button 
                onClick={() => {
                  navigate('/enroll');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium"
              >
                <BookOpen className="w-4 h-4 ml-2" />
                سجل الآن
              </Button>
              <Button 
                onClick={() => {
                  navigate('/admin');
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full"
              >
                لوحة التحكم
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;