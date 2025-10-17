import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ScoringPolicy = "Classic" | "PodiumAtAllCosts";

interface ScoringPolicyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    policy: ScoringPolicy;
}

export function ScoringPolicyDialog({ open, onOpenChange, policy }: ScoringPolicyDialogProps) {
    const policyLines = policy === "Classic"
        ? [
            "1 miejsce --> 10 punktów",
            "2 miejsce --> 9 punktów",
            "3 miejsce --> 8 punktów",
            "4 miejsce --> 7 punktów",
            "5 miejsce --> 6 punktów",
            "6-10 miejsce --> 5 punktów",
            "11-20 miejsce --> 3 punkty",
            "21-30 miejsce --> 1 punkt",
        ]
        : [
            "1 miejsce --> 15 punktów",
            "2 miejsce --> 15 punktów",
            "3 miejsce --> 15 punktów",
            "4-10 miejsce --> 5 punktów",
            "11-20 miejsce --> 2 punkty",
            "21-30 miejsce --> 1 punkt",
        ];

    const policySummary = policy === "Classic"
        ? "W tym przypadku punkty są liczone systemem klasycznym, który jest dość zrównoważony"
        : "W tym przypadku punkty są liczone systemem, który szczególnie nagradza miejsca na podium";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Jak liczone są punkty?</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-neutral-300">
                        Gracze zdobywają punkty za miejsca swoich zawodników w konkursie.
                    </p>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm leading-6">
                            {policyLines.join("\n")}
                        </pre>
                    </div>
                    <p className="text-sm text-neutral-400">{policySummary}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

