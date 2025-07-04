﻿import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { signIn } from "../../api/user.api"
import { Button } from "../../components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"
import Image from "../../components/ui/image"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { signInFailure, signInSuccess } from "../../redux/user/userSlice"

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await signIn(formData.email, formData.password)
      const user = response.data[0]
      dispatch(signInSuccess(user))
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      dispatch(signInFailure(err instanceof Error ? err.message : "Something went wrong"))
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-3">
              <Image
                src="eventra.png"
                alt="Eventra Logo"
                className="h-24 sm:h-32 md:h-36 w-auto"
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Sign in to continue to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-xs sm:text-sm text-red-500 text-center break-words">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              className="w-full text-sm"
              variant="blue"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue"}
            </Button>
            <div className="text-center text-xs sm:text-sm">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-xs sm:text-sm"
                type="button"
                onClick={() => navigate('/signup')}
              >
                Sign up
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
