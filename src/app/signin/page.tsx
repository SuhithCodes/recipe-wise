'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await signIn(values.email, values.password);
      router.push('/');
      toast({ title: "Success", description: "You are now signed in." });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({ variant: "destructive", title: "Sign In Failed", description: "Invalid email or password. Please try again." });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
      toast({ title: "Success", description: "You are now signed in with Google." });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({ variant: "destructive", title: "Google Sign In Failed", description: "Could not sign in with Google. Please try again." });
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in to manage your recipes and shopping lists.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Form>
        <div className="px-6 pb-4">
            <div className="relative my-2">
                <Separator />
                <div className="absolute left-1/2 -translate-x-1/2 -top-3">
                    <span className="bg-background px-2 text-xs uppercase text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.66 1.98-3.56 0-6.21-2.82-6.21-6.38s2.65-6.38 6.21-6.38c2.2 0 3.33.93 4.13 1.82l2.35-2.35C17.29 2.59 15.12 1.5 12.48 1.5c-5.48 0-9.44 4.34-9.44 9.44s3.96 9.44 9.44 9.44c2.8 0 5.08-1.02 6.78-2.72 1.76-1.7 2.4-4.15 2.4-6.38 0-.5-.05-.95-.1-1.4z"
                  ></path>
                </svg>
                Google
            </Button>
        </div>
         <CardFooter className="flex flex-col gap-4">
          <p className="text-xs text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
