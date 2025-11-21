"use client";

import { useEffect } from "react";

export default function BmcWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "withsy");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute(
      "data-message",
      "Your coffee helps cover server costs — thank you!"
    );
    script.setAttribute("data-color", "#FF813F");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;

    script.addEventListener("load", () => {
      window.dispatchEvent(
        new Event("DOMContentLoaded", {
          bubbles: false,
          cancelable: false,
        })
      );
    });

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);

      document
        .querySelectorAll('[id^="bmc-"], [class^="bmc-"]')
        .forEach((element) => {
          if (element.parentNode) element.parentNode.removeChild(element);
        });
    };
  }, []);

  return null;
}
