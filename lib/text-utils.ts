import React from "react";

/**
 * Converte texto com URLs em JSX com links clicáveis
 * @param text - O texto que pode conter URLs
 * @param maxLinkLength - Comprimento máximo do link exibido (padrão: 50)
 * @returns Array de elementos JSX (string ou JSX.Element)
 */
export function parseTextWithLinks(
  text: string,
  maxLinkLength: number = 50
): (string | React.ReactElement)[] {
  if (!text || typeof text !== "string") {
    return [text || ""];
  }

  // Regex para detectar URLs (http/https)
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;

  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Adiciona texto antes do link
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      if (textBefore) {
        parts.push(textBefore);
      }
    }

    const fullUrl = match[0];
    let displayUrl = fullUrl;

    // Trunca o link se for muito longo
    if (fullUrl.length > maxLinkLength) {
      displayUrl = fullUrl.slice(0, maxLinkLength - 3) + "...";
    }

    // Cria o elemento link
    const linkElement = React.createElement(
      "a",
      {
        key: `link-${match.index}`,
        href: fullUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-blue-400 hover:underline break-all",
      },
      displayUrl
    );

    parts.push(linkElement);
    lastIndex = match.index + fullUrl.length;
  }

  // Adiciona texto restante após o último link
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  // Se não há links, retorna o texto original
  if (parts.length === 0) {
    return [text];
  }

  return parts;
}

/**
 * Componente React que renderiza texto com links clicáveis
 * @param text - O texto que pode conter URLs
 * @param maxLinkLength - Comprimento máximo do link exibido
 * @param className - Classes CSS adicionais para o container
 */
export function TextWithLinks({
  text,
  maxLinkLength = 50,
  className = "",
}: {
  text: string;
  maxLinkLength?: number;
  className?: string;
}) {
  const parts = parseTextWithLinks(text, maxLinkLength);

  return React.createElement("div", { className }, ...parts);
}
