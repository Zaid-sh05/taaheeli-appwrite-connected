import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useAI } from "@/context/AIContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { formatRelative } from "@/lib/format";
import {
  Sparkles,
  Send,
  Mic,
  Volume2,
  Heart,
  Sun,
  Wind,
  Phone,
} from "lucide-react";

interface QuickAction {
  key: string;
  label: string;
  icon: typeof Heart;
  userMessage: string;
}

const quickActions: QuickAction[] = [
  {
    key: "encourage",
    label: "تشجيع",
    icon: Heart,
    userMessage: "أحتاج بعض التشجيع اليوم",
  },
  {
    key: "today-plan",
    label: "برنامج اليوم",
    icon: Sun,
    userMessage: "ما برنامجي لليوم؟",
  },
  {
    key: "relax",
    label: "استرخاء",
    icon: Wind,
    userMessage: "أريد تمرين استرخاء",
  },
  {
    key: "contact-center",
    label: "تواصل مع المركز",
    icon: Phone,
    userMessage: "أريد التواصل مع المركز",
  },
];

export function PatientCompanionPage() {
  useDocumentTitle("المرافق الذكي");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, sendCompanionMessage } = useDemoData();
  const { companionReply } = useAI();
  const { showToast } = useToast();

  const [inputText, setInputText] = useState("");
  const [replying, setReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-seeded with companionMessages from data
  const messages = useMemo(() => data.companionMessages, [data.companionMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendToCompanion(text: string) {
    sendCompanionMessage(text, "user");
    setReplying(true);
    try {
      const reply = await companionReply(text);
      sendCompanionMessage(reply.text, "companion");
      if (reply.safetyAction === "emergency") {
        showToast("يرجى التواصل مع الطوارئ فوراً", "error");
      } else if (reply.safetyAction === "refer-to-center") {
        showToast("المرافق يحيلك للتواصل مع المركز", "info");
      }
    } catch (error) {
      sendCompanionMessage(
        "تعذر تشغيل المرافق التجريبي الآن. يرجى التواصل مع المركز عند الحاجة.",
        "companion",
      );
      showToast(
        error instanceof Error ? error.message : "تعذر تشغيل المرافق",
        "error",
      );
    } finally {
      setReplying(false);
    }
  }

  function handleSendQuick(action: QuickAction) {
    if (replying) return;
    void sendToCompanion(action.userMessage);
  }

  function handleSendCustom() {
    const text = inputText.trim();
    if (!text || replying) return;
    setInputText("");
    void sendToCompanion(text);
  }

  function handleMic() {
    showToast("الميكروفون تجريبي - غير متصل", "info");
  }

  function handleSpeaker() {
    showToast("مكبر الصوت تجريبي - غير متصل", "info");
  }

  function handleContactCenter() {
    showToast("سيتم تحويلك لصفحة المواعيد للتواصل مع المركز", "info");
  }

  return (
    <PageContainer maxWidth="max-w-2xl" className="py-8">
      <PageHeader
        title="المرافق الذكي"
        subtitle="مرافقك التجريبي للدعم والتشجيع في رحلة تأهيلك"
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">المحادثة مع المرافق الذكي</h2>

      {/* Persistent safety message */}
      <Alert tone="warning" className="mb-6">
        <p className="font-bold mb-1">تنبيه مهم</p>
        <p className="leading-relaxed">
          هذا المرافق تجريبي ولا يغني عن الاستشارة الطبية. في حالة الطوارئ اتصل بالرقم 911
        </p>
      </Alert>

      {/* Chat area */}
      <Card className="mb-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
          <div className="rounded-full bg-primary-100 p-2 shrink-0">
            <Sparkles className="h-6 w-6 text-primary-700" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold text-ink">المرافق الذكي</p>
            <p className="text-sm text-neutral-500">
              Mock Provider محلي — لا يرسل بيانات خارج الجهاز
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 p-2">
          {messages.length === 0 ? (
            <p className="text-center text-base text-neutral-500 py-8">
              لا توجد رسائل بعد. ابدأ بالضغط على أحد الأزرار السريعة أدناه.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  "flex " + (msg.sender === "user" ? "justify-start" : "justify-end")
                }
              >
                <div
                  className={
                    "max-w-[80%] rounded-2xl px-4 py-3 " +
                    (msg.sender === "user"
                      ? "bg-primary-100 text-ink rounded-bl-sm"
                      : "bg-neutral-100 text-ink rounded-br-sm")
                  }
                >
                  <p className="text-base leading-relaxed">{msg.text}</p>
                  <p className="text-xs text-neutral-500 mt-1">{formatRelative(msg.timestamp)}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                onClick={() => handleSendQuick(action)}
                disabled={replying}
                className={
                  "inline-flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-primary-200 bg-white px-3 py-3 text-base font-semibold text-primary-700 hover:bg-primary-50 transition-colors min-h-[56px]"
                }
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text input */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCustom();
                }
              }}
              placeholder="اكتب رسالتك هنا..."
              className="w-full rounded-lg border-2 border-neutral-200 bg-white px-3 py-2.5 text-base text-ink placeholder:text-neutral-400 min-h-[56px] resize-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 focus:border-primary-500"
              rows={1}
            />
          </div>
          <button
            type="button"
            onClick={handleMic}
            className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 min-h-[56px] min-w-[56px] shrink-0"
            aria-label="ميكروفون"
            title="ميكروفون تجريبي"
          >
            <Mic className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleSpeaker}
            className="inline-flex items-center justify-center rounded-lg border-2 border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 min-h-[56px] min-w-[56px] shrink-0"
            aria-label="مكبر الصوت"
            title="مكبر الصوت تجريبي"
          >
            <Volume2 className="h-6 w-6" aria-hidden="true" />
          </button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSendCustom}
            loading={replying}
            disabled={!inputText.trim()}
            leftIcon={<Send className="h-5 w-5" aria-hidden="true" />}
            className="shrink-0"
          >
            إرسال
          </Button>
        </div>
      </Card>

      {/* Contact center action */}
      <Card className="bg-primary-50 border-primary-200">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary-100 p-2 shrink-0">
            <Phone className="h-6 w-6 text-primary-700" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-ink mb-1">تواصل مع المركز</p>
            <p className="text-base text-neutral-700 leading-relaxed mb-4">
              إذا احتجت مساعدة من فريق المركز، يمكنك الذهاب إلى صفحة المواعيد لطلب موعد أو التواصل مباشرة.
            </p>
            <Link to="/patient/appointments">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Phone className="h-5 w-5" aria-hidden="true" />}
                onClick={handleContactCenter}
              >
                تواصل مع المركز
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
