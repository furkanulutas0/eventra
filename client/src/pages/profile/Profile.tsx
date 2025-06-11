
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Mail, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@example.com"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <Card className="p-4 sm:p-6">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="relative mx-auto mb-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl sm:text-2xl font-semibold">
                {formData.firstName[0]}{formData.lastName[0]}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-0 right-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <CardTitle className="text-xl sm:text-2xl">Profile Settings</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Manage your account information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto text-sm"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="w-full sm:w-auto text-sm"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full sm:w-auto text-sm"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Account Settings</CardTitle>
            <CardDescription className="text-sm">
              Additional account management options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start text-sm">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive text-sm">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
