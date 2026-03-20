import type { GitCommitMessageMode } from "@t3tools/contracts";
import {
  CheckIcon,
  ChevronRightIcon,
  GitBranchIcon,
  InfoIcon,
  Settings2Icon,
  SparklesIcon,
  SmileIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

const COMMIT_MODES: ReadonlyArray<{
  value: GitCommitMessageMode;
  label: string;
  summary: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: "standard",
    label: "Conventional",
    summary: "Conventional format",
    description:
      "Follows strict conventional commit format with type, optional scope, and description",
    icon: GitBranchIcon,
  },
  {
    value: "auto",
    label: "Auto",
    summary: "Infer from repo",
    description:
      "Analyzes past commit messages, selects the best example, and adapts to your repo's existing patterns",
    icon: SparklesIcon,
  },
  {
    value: "gitmoji",
    label: "Gitmoji",
    summary: "Emoji + conventional",
    description:
      "Uses Gitmoji emoji prefixes while following conventional commit structure for expressive commits",
    icon: SmileIcon,
  },
  {
    value: "custom",
    label: "Custom",
    summary: "Your own rules",
    description: "Use a predefined template or provide your own instructions for custom formatting",
    icon: Settings2Icon,
  },
] as const;

const CUSTOM_TEMPLATES: ReadonlyArray<{
  id: string;
  label: string;
  prompt: string;
  description: string;
  example: string;
}> = [
  {
    id: "standard",
    label: "Conventional",
    prompt: "Conventional Commits: '<type>(<scope>): <subject>'",
    description: "Most common machine-readable format for changelogs and release tooling",
    example: "feat(auth): add login validation",
  },
  {
    id: "conventional-ticket",
    label: "Conventional + Ticket",
    prompt:
      "Conventional Commits with ticket reference in footer: '<type>(<scope>): <subject>' plus footer like 'Refs: PROJ-123'",
    description: "Best fit when you need issue tracking without breaking conventional tooling",
    example: "feat(auth): add login validation",
  },
  {
    id: "simple",
    label: "Simple",
    prompt: "Simple git message: imperative subject only, no prefix",
    description: "Plain readable fallback when you do not need automated parsing",
    example: "add login validation",
  },
] as const;

interface CommitModeSelectorProps {
  value: GitCommitMessageMode;
  onChange: (value: GitCommitMessageMode) => void;
  customInstructions: string;
  onCustomInstructionsChange: (value: string) => void;
  commitMessage: string;
  onCommitMessageChange: (value: string) => void;
  disabled?: boolean;
}

export function CommitModeSelector({
  value,
  onChange,
  customInstructions,
  onCustomInstructionsChange,
  commitMessage,
  onCommitMessageChange,
  disabled = false,
}: CommitModeSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);

  const selectedMode = COMMIT_MODES.find((mode) => mode.value === value);

  useEffect(() => {
    if (value !== "custom" && customInstructions.trim()) {
      onCustomInstructionsChange("");
    }
  }, [value, customInstructions, onCustomInstructionsChange]);

  const handleTemplateSelect = (template: (typeof CUSTOM_TEMPLATES)[number]) => {
    onCommitMessageChange(template.prompt);
    setTemplatePopoverOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">Commit style</span>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex items-center rounded hover:bg-accent/50 transition-colors p-0.5"
              >
                <InfoIcon className="size-3.5 text-muted-foreground" />
              </button>
            }
          />
          <PopoverPopup side="top" align="start" sideOffset={8} tooltipStyle>
            <div className="space-y-2 p-2">
              <p className="font-medium text-xs">How commit messages are generated</p>
              <ul className="space-y-1.5 text-[10px] text-muted-foreground">
                {COMMIT_MODES.map((mode) => (
                  <li key={mode.value} className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <mode.icon className="size-2.5 shrink-0" />
                      <strong className="text-xs">{mode.label}:</strong>
                      <span>{mode.summary}</span>
                    </div>
                    <p className="text-[9px] opacity-80 pl-5">{mode.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </PopoverPopup>
        </Popover>

        {selectedMode && (
          <div className="flex items-center align-baseline gap-0.5 text-xs text-muted-foreground">
            <span>(</span>
            <selectedMode.icon className="size-3 shrink-0" />
            <span>{selectedMode.summary}</span>
            <span>)</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {COMMIT_MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <Button
              key={mode.value}
              variant={"outline"}
              size="xs"
              disabled={disabled}
              className={cn(value === mode.value && "border-primary")}
              onClick={() => onChange(mode.value)}
            >
              <Icon className="size-2.5 shrink-0" />
              <span className="text-xs font-medium">{mode.label}</span>
            </Button>
          );
        })}
      </div>

      {value === "custom" && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Select a template or enter custom instructions</p>
          <Popover open={templatePopoverOpen} onOpenChange={setTemplatePopoverOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  disabled={disabled}
                >
                  <span className="text-xs">
                    {commitMessage.trim() ? "✓ Template applied" : "Choose a template..."}
                  </span>
                  <ChevronRightIcon className="size-3.5" />
                </Button>
              }
            />
            <PopoverPopup align="start" sideOffset={8} className="w-80">
              <div className="space-y-1 p-1">
                <p className="px-2 pt-1 text-[10px] font-medium text-muted-foreground">
                  PREDEFINED TEMPLATES
                </p>
                {CUSTOM_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleTemplateSelect(template)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{template.label}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                    {commitMessage.includes(template.prompt) && (
                      <CheckIcon className="size-3 shrink-0 text-success" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverPopup>
          </Popover>
          {commitMessage && (
            <p className="text-[9px] text-muted-foreground">
              💡 Template applied to commit message above. Edit to customize.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
