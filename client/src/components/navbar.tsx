import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Heart, Menu } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/support", label: "Support" },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${
            mobile ? "block py-2" : ""
          } text-gray-700 dark:text-gray-300 hover:text-medicate-primary dark:hover:text-medicate-secondary transition-colors ${
            location === item.href ? "text-medicate-primary dark:text-medicate-secondary font-medium" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-white dark:bg-card shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-medicate-primary animate-heartbeat" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">Medicate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.name}
                </span>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link href="/login">
                  <Button className="btn-primary">Login</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                  {user ? (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {user.name}
                      </p>
                      <Button variant="outline" onClick={logout} className="w-full">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t">
                      <Link href="/login" className="w-full">
                        <Button className="w-full btn-primary">Login</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
