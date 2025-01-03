'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/actions"
import { useActionState } from "react"


export function LoginForm() {
    const [state, loginAction,isLoading] = useActionState(login,undefined)
    
    return (
      <Card className="w-1/5">
        <CardHeader>
          <CardTitle className="text-2xl text-center">登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="输入用户名"
                required
              />
            </div>
            {state?.errors?.username && (
              <p className="text-red-500 text-xs">{state.errors.username}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="输入密码"
                required
              />
            </div>
            {state?.errors?.password && (
              <p className="text-red-500 text-xs">{state.errors.password}</p>
            )}
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
}
