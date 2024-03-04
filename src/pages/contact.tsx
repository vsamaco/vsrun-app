/* eslint-disable @typescript-eslint/no-misused-promises */
import { useSubmit } from "@formspree/react";
import Head from "next/head";
import { FormProvider, useForm } from "react-hook-form";
import Layout from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

type Inputs = {
  email: string;
  message: string;
  name: string;
};

export default function ContactPage() {
  const methods = useForm<Inputs>();
  const {
    formState: { errors, isSubmitSuccessful, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = methods;

  const submit = useSubmit<Inputs>(
    process.env.NEXT_PUBLIC_REACT_HOOK_FORM_ID as string,
    {
      onError(errs) {
        const formErrs = errs.getFormErrors();
        for (const { code, message } of formErrs) {
          setError(`root.${code}`, {
            type: code,
            message,
          });
        }

        const fieldErrs = errs.getAllFieldErrors();
        for (const [field, errs] of fieldErrs) {
          setError(field, {
            message: errs.map((e) => e.message).join(", "),
          });
        }
      },
    }
  );

  return (
    <>
      <Head>
        <title>vsrun | Contact</title>
        <meta name="description" content="vsrun | contact" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="space-y-5 p-4 md:p-10 ">
        <h1 className="text-lg font-medium">Contact</h1>
        <p className="text-sm text-muted-foreground">
          Please use form below for any questions about vsrun app.
        </p>
        {isSubmitSuccessful ? (
          <h2 className="text-sm">Your message has been sent successfully!</h2>
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(submit)}
              className="space-y-8 md:max-w-[400px]"
            >
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...register("email")} id="email" type="email" />
                </FormControl>
                <FormMessage>
                  {errors.email && (
                    <p className="error">{errors.email.message}</p>
                  )}
                </FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...register("name")} id="name" type="text" />
                </FormControl>
                <FormMessage>
                  {errors.name && (
                    <p className="error">{errors.name.message}</p>
                  )}
                </FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea {...register("message")} id="message" rows={10} />
                </FormControl>
                <FormMessage>
                  {errors.name && (
                    <p className="error">{errors.name.message}</p>
                  )}
                </FormMessage>
              </FormItem>

              {errors.root && (
                <div className="block">
                  <ul className="error">
                    {Object.values(errors.root).map((err) => {
                      if (typeof err !== "object") {
                        return <li key={err}>{err}</li>;
                      }
                      const { type, message } = err;
                      return <li key={type}>{message}</li>;
                    })}
                  </ul>
                </div>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </FormProvider>
        )}
      </div>
    </>
  );
}

ContactPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout showNav={true}>{page}</Layout>;
};
