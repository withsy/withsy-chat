import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Option = { label: string; value: string };

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  options: Option[];
  className?: string;
};

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
}: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
