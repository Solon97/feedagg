"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, MoreHorizontal, Clock, Calendar } from "lucide-react"

export default function ArticleExample() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
              <div className="w-5 h-3 bg-white rounded-sm transform rotate-12"></div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Digestly</h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <a href="/saved-content" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">
                Saved Content
              </a>
              <a href="/" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">
                Dashboard
              </a>
            </nav>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">Log out</button>
          </div>
        </div>
      </header>

      {/* Article View */}
      <main className="px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <a
            href="/saved-content"
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Saved Content
          </a>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    Engenharia de Prompts: A Nova Habilidade Essencial da Era da IA
                  </CardTitle>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
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
                <div className="flex gap-2">
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
            <CardContent>
              <div className="article-content">
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
        </div>
      </main>

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
