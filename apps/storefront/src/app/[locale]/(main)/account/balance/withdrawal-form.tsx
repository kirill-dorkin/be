"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nimara/ui/components/form";
import { Input } from "@nimara/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";
import { useToast } from "@nimara/ui/hooks";

import { requestWithdrawal } from "@/lib/actions/referral";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/referral/types";

const withdrawalSchema = z.object({
  amount: z.coerce.number().min(MIN_WITHDRAWAL_AMOUNT),
  method: z.enum(["BANK_TRANSFER", "MOBILE_MONEY", "CARD"]),
  accountInfo: z.string().min(5),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalFormProps {
  currency: string;
  currentBalance: number;
}

export function WithdrawalForm({
  currentBalance,
  currency,
}: WithdrawalFormProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: MIN_WITHDRAWAL_AMOUNT,
      method: "BANK_TRANSFER",
      accountInfo: "",
    },
  });

  const onSubmit = async (data: WithdrawalFormData) => {
    setIsSubmitting(true);

    const result = await requestWithdrawal(data.amount, data.method);

    setIsSubmitting(false);

    if (!result.ok) {
      toast({
        title: t("errors.UNKNOWN_ERROR"),
        description: result.errors[0]?.message || undefined,
        variant: "destructive",
      });

      return;
    }

    toast({
      title: t("balance.withdrawal-requested"),
    });

    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={currentBalance < MIN_WITHDRAWAL_AMOUNT}>
          {t("balance.withdraw")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("balance.withdrawal-request")}</DialogTitle>
          <DialogDescription>
            {t("balance.min-withdrawal", {
              amount: MIN_WITHDRAWAL_AMOUNT,
              currency,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("balance.withdrawal-amount")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={String(MIN_WITHDRAWAL_AMOUNT)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("balance.withdrawal-method")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">
                        {t("balance.withdrawal-method-bank")}
                      </SelectItem>
                      <SelectItem value="MOBILE_MONEY">
                        {t("balance.withdrawal-method-mobile")}
                      </SelectItem>
                      <SelectItem value="CARD">
                        {t("balance.withdrawal-method-card")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("balance.account-info")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("balance.account-info-placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("balance.request-withdrawal")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
