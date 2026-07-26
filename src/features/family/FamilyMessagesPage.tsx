import { useMemo, useRef, useState, useEffect } from "react";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative } from "@/lib/format";
import { MessageCircle, Send, User, Stethoscope, Info, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/types/demo";

const senderLabels: Record<ChatMessage["sender"], string> = {
  therapist: "المعالج",
  family: "أنت",
  patient: "المستفيد",
  system: "النظام",
};

function senderIcon(sender: ChatMessage["sender"]) {
  if (sender === "therapist") return <Stethoscope className="h-5 w-5 text-primary-600" aria-hidden="true" />;
  if (sender === "family") return <User className="h-5 w-5 text-accent-600" aria-hidden="true" />;
  if (sender === "system") return <Info className="h-5 w-5 text-neutral-500" aria-hidden="true" />;
  return <User className="h-5 w-5 text-neutral-500" aria-hidden="true" />;
}

export function FamilyMessagesPage() {
  useDocumentTitle("الرسائل");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, sendMessage } = useDemoData();
  const { showToast } = useToast();

  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Identify the linked patient: first patient with a caregiverName field, else patients[0].
  const patient = useMemo(
    () => data.patients.find((p) => p.caregiverName) ?? data.patients[0],
    [data.patients],
  );

  // Find the conversation linked to this patient
  const conversation = useMemo(
    () => data.conversations.find((c) => c.patientId === patient.id),
    [data.conversations, patient.id],
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (conversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  function handleSend() {
    if (!conversation) return;
    const trimmed = draft.trim();
    if (!trimmed) {
      showToast("يرجى كتابة رسالة أولاً", "error");
      return;
    }
    sendMessage(conversation.id, "family", trimmed);
    setDraft("");
    showToast("تم إرسال الرسالة");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <PageHeader
        title="الرسائل"
        subtitle={`التواصل مع المركز حول رعاية ${patient.fullName}`}
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">صفحة الرسائل</h2>

      {conversation ? (
        <Card className="flex flex-col" style={{ minHeight: "60vh" }}>
          {/* Conversation header */}
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
            <div className="rounded-full bg-primary-100 p-2 shrink-0">
              <MessageCircle className="h-6 w-6 text-primary-700" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-ink">محادثة حول {patient.fullName}</p>
              <p className="text-sm text-neutral-500">تواصل مباشر مع المعالج والمركز</p>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4" style={{ maxHeight: "50vh" }}>
            {conversation.messages.length === 0 ? (
              <EmptyState
                icon={<MessageCircle className="h-12 w-12" aria-hidden="true" />}
                title="لا توجد رسائل بعد"
                description="ابدئي المحادثة بكتابة رسالة أدناه."
              />
            ) : (
              conversation.messages.map((msg) => {
                const isFamily = msg.sender === "family";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isFamily ? "flex-row-reverse" : ""}`}
                  >
                    <div className="shrink-0 mt-1">
                      {senderIcon(msg.sender)}
                    </div>
                    <div className={`max-w-[75%] ${isFamily ? "items-end" : "items-start"} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-neutral-600">
                          {senderLabels[msg.sender]}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {formatRelative(msg.timestamp)}
                        </span>
                        {isFamily && (
                          <CheckCheck className="h-4 w-4 text-primary-500" aria-label="تم الإرسال" />
                        )}
                      </div>
                      <div
                        className={
                          isFamily
                            ? "rounded-2xl rounded-tr-sm bg-primary-600 text-white px-4 py-3 text-base leading-relaxed"
                            : "rounded-2xl rounded-tl-sm bg-neutral-100 text-ink px-4 py-3 text-base leading-relaxed"
                        }
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Compose area */}
          <div className="pt-4 border-t border-neutral-100">
            <Field label="اكتبي رسالة">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتبي رسالتك هنا... (اضغط Enter للإرسال)"
                className="min-h-[80px]"
              />
            </Field>
            <div className="flex justify-end">
              <Button
                variant="primary"
                leftIcon={<Send className="h-5 w-5" aria-hidden="true" />}
                onClick={handleSend}
                disabled={!draft.trim()}
              >
                إرسال
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<MessageCircle className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد محادثة بعد"
            description={`لم يتم إنشاء محادثة لـ${patient.fullName} بعد. يمكنك بدء محادثة مع المركز للتواصل حول رعايتها.`}
            action={
              <Button
                variant="primary"
                leftIcon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
                onClick={() => {
                  // Note: In the demo, conversations are pre-seeded.
                  // If no conversation exists, we inform the user.
                  showToast("سيتم إنشاء محادثة عند أول رسالة من المركز", "info");
                }}
              >
                بدء محادثة
              </Button>
            }
          />
        </Card>
      )}

      {/* Info note */}
      <div className="mt-6">
        <div className="flex items-start gap-3 text-base text-neutral-600">
          <Info className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            هذه المحادثة للتواصل مع المركز والمعالج حول {patient.fullName}. الرسائل داخل التطبيق فقط ولا تستخدم أي خدمة رسائل خارجية.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
