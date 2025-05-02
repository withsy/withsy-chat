import type { GetServerSideProps } from "next";
import { createSwaggerSpec } from "next-swagger-doc";
import { notFound } from "next/navigation";
import { useEffect, useRef } from "react";
import { SwaggerUIBundle } from "swagger-ui-dist";
import "swagger-ui-dist/swagger-ui.css";

type Props = {
  spec: any;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/pages/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: `Withsy API Documentation`,
        version: "0.0.0",
      },
    },
  });

  return { props: { spec } };
};

export default function Page({ spec }: Props) {
  if (process.env.NODE_ENV === "production") notFound();

  const swaggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!swaggerRef.current || !spec) return;
    SwaggerUIBundle({
      domNode: swaggerRef.current,
      spec,
    });
  }, []);

  return <div className="swagger-ui-wrapper" ref={swaggerRef} />;
}
