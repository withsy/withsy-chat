// components/BmcWidget.tsx
"use client";

export default function BmcWidget() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <script 
            data-name="BMC-Widget" 
            data-cfasync="false" 
            src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
            data-id="withsy"
            data-description="Support me on Buy me a coffee!"
            data-message="Your coffee helps cover server costs — thank you!"
            data-color="#FF813F"
            data-position="Right"
            data-x_margin="18"
            data-y_margin="18">
            bmc
          </script>
        `,
      }}
    />
  );
}
