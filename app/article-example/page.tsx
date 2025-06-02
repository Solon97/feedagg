"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  ExternalLink,
  MoreHorizontal,
  Clock,
  Calendar,
  Share,
  Bookmark,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useState } from "react"

export default function ArticleExample() {
  const [fontSize, setFontSize] = useState("base")
  const [isBookmarked, setIsBookmarked] = useState(false)

  const fontSizes = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  const increaseFontSize = () => {
    const sizes = Object.keys(fontSizes)
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1])
    }
  }

  const decreaseFontSize = () => {
    const sizes = Object.keys(fontSizes)
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-teal-500 rounded flex items-center justify-center">
                <div className="w-4 h-3 md:w-5 md:h-3 bg-white rounded-sm transform rotate-12"></div>
              </div>
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900">Digestly</h1>
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`h-8 w-8 p-0 md:h-10 md:w-auto md:px-3 ${isBookmarked ? "text-teal-600" : "text-gray-600"}`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="hidden md:inline ml-2">{isBookmarked ? "Saved" : "Save"}</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:h-10 md:w-auto md:px-3 text-gray-600">
              <Share className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Share</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:h-10 md:w-auto md:px-3 text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
              <span className="hidden md:inline ml-2">More</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Article View */}
      <main className="px-4 md:px-6 py-4 md:py-8">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-4 md:mb-8">
          <a
            href="/saved-content"
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Saved Content</span>
            <span className="sm:hidden">Back</span>
          </a>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="pb-4 md:pb-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                    Engenharia de Prompts: A Nova Habilidade Essencial da Era da IA
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">TechBlog Brasil</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>8 min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Saved 2 days ago</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Original
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Reading Controls */}
            <div className="px-4 md:px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 hidden sm:inline">Reading size:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    disabled={fontSize === "sm"}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center capitalize">{fontSize}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    disabled={fontSize === "xl"}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="pt-6">
              <div className={`article-content ${fontSizes[fontSize as keyof typeof fontSizes]}`}>
                <div id="readability-page-1">
                  {/* Introdução */}
                  <p>
                    A IA generativa já faz parte do nosso dia a dia. Aprender a "conversar" com ela, ou seja, dominar a{" "}
                    <strong>engenharia de prompts</strong>, é essencial para guiar seu potencial.
                  </p>

                  {/* Exemplo de figura */}
                  <figure>
                    <img src="/placeholder.svg?height=400&width=600" alt="Pessoa ensinando IA" />
                    <figcaption>"Saber falar com a IA é o novo inglês."</figcaption>
                  </figure>

                  {/* Seção de definição */}
                  <h3>O que é engenharia de prompts?</h3>
                  <p>
                    É a arte de criar instruções claras para modelos de linguagem (LLMs) gerarem resultados precisos,
                    como um chef que segue uma receita detalhada.
                  </p>

                  {/* Seção de importância */}
                  <h3>Por que é importante?</h3>
                  <ul>
                    <li>
                      <strong>Desenvolvimento de software:</strong> gerar código, testes e documentações.
                    </li>
                    <li>
                      <strong>Marketing:</strong> criar textos persuasivos e ideias para campanhas.
                    </li>
                    <li>
                      <strong>Educação:</strong> material didático adaptativo e tutores virtuais.
                    </li>
                  </ul>

                  {/* Tabela simplificada */}
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Setor</th>
                          <th>Benefício</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Data Science</td>
                          <td>Scripts de análise e visualizações rápidas</td>
                        </tr>
                        <tr>
                          <td>Design</td>
                          <td>Geração de ideias visuais</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Citação */}
                  <blockquote>
                    <p>"O futuro é conversacional – você está pronto para liderar a conversa?"</p>
                  </blockquote>

                  {/* Links para aprofundar */}
                  <p>
                    Saiba mais em:
                    <a href="https://www.rocketseat.com.br/formacao/ia-para-devs">Formação IA para devs</a> |
                    <a href="https://www.rocketseat.com.br/formacao/ia">Desenvolvimento de IA</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Action Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Original
              </Button>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                className={`flex-1 h-12 ${isBookmarked ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}`}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                {isBookmarked ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Add bottom padding for mobile action bar */}
      <div className="h-20 md:hidden"></div>

      <style jsx>{`
        .article-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.7;
          color: #374151;
        }

        .article-content p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          text-align: justify;
        }

        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 2rem 0 1rem 0;
          border-bottom: 2px solid #14b8a6;
          padding-bottom: 0.5rem;
        }

        .article-content strong {
          font-weight: 600;
          color: #14b8a6;
        }

        .article-content figure {
          margin: 2rem 0;
          text-align: center;
        }

        .article-content figure img {
          width: 100%;
          max-width: 600px;
          height: auto;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .article-content figcaption {
          margin-top: 0.75rem;
          font-style: italic;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .article-content ul {
          margin: 1.5rem 0;
          padding-left: 0;
          list-style: none;
        }

        .article-content ul li {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          position: relative;
          font-size: 1.05rem;
        }

        .article-content ul li::before {
          content: "▶";
          color: #14b8a6;
          font-size: 0.8rem;
          position: absolute;
          left: 0;
          top: 0.1rem;
        }

        .article-content table {
          width: 100%;
          margin: 2rem 0;
          border-collapse: collapse;
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .article-content table thead {
          background: #14b8a6;
          color: white;
        }

        .article-content table th,
        .article-content table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .article-content table th {
          font-weight: 600;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .article-content table td {
          font-size: 1rem;
        }

        .article-content table tbody tr:hover {
          background: #f9fafb;
        }

        .article-content table tbody tr:last-child td {
          border-bottom: none;
        }

        .article-content blockquote {
          margin: 2rem 0;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
          border-left: 4px solid #14b8a6;
          border-radius: 0 0.75rem 0.75rem 0;
          position: relative;
        }

        .article-content blockquote::before {
          content: """;
          font-size: 4rem;
          color: #14b8a6;
          position: absolute;
          top: -0.5rem;
          left: 1rem;
          font-family: Georgia, serif;
          opacity: 0.3;
        }

        .article-content blockquote p {
          margin: 0;
          font-size: 1.2rem;
          font-style: italic;
          color: #065f46;
          font-weight: 500;
          text-align: center;
        }

        .article-content a {
          color: #14b8a6;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .article-content a:hover {
          color: #0f766e;
          border-bottom-color: #0f766e;
        }

        .article-content a:visited {
          color: #0d9488;
        }

        @media (max-width: 768px) {
          .article-content {
            font-size: 1rem;
          }
          
          .article-content h3 {
            font-size: 1.3rem;
          }
          
          .article-content table {
            font-size: 0.9rem;
          }
          
          .article-content table th,
          .article-content table td {
            padding: 0.75rem 0.5rem;
          }
          
          .article-content blockquote {
            padding: 1rem 1.5rem;
          }
          
          .article-content blockquote p {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  )
}
