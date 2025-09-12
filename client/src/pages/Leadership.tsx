import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import iskconLogo from "@assets/iskcon_logo.png";
import namhattaLogo from "@assets/namhatta_logo.png";

export default function Leadership() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-300" data-testid="text-header">
            Leadership Hierarchy
          </h1>
          <p className="text-xl md:text-2xl text-slate-300" data-testid="text-organization">
            International Society for Krishna Consciousness
          </p>
          <p className="text-sm text-slate-400" data-testid="text-subtitle">
            Organizational structure and leadership roles
          </p>
        </div>

        {/* Founder Acharya Card - Full Width */}
        <Card className="bg-slate-800/50 border-orange-500/30 shadow-2xl" data-testid="card-founder-acharya">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-12 h-12 object-contain filter brightness-0 invert"
                    data-testid="img-founder-logo"
                  />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2" data-testid="text-founder-title">
                  ISKCON Founder Acharya
                </h2>
                <div className="space-y-1">
                  <p className="text-lg md:text-xl font-semibold text-orange-200" data-testid="text-founder-name">
                    His Divine Grace A. C. Bhaktivedanta Swami Prabhupada
                  </p>
                  <p className="text-sm text-orange-300" data-testid="text-founder-subtitle">
                    ISKCON Founder Acharya
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GBC Card */}
          <Card className="bg-slate-800/50 border-purple-500/30 shadow-xl" data-testid="card-gbc">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-8 h-8 object-contain filter brightness-0 invert"
                    data-testid="img-gbc-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2" data-testid="text-gbc-title">
                    ISKCON GBC & Namhatta Preaching Minister
                  </h3>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-purple-200" data-testid="text-gbc-name">
                      His Holiness Jayapataka Swami
                    </p>
                    <p className="text-sm text-purple-300" data-testid="text-gbc-subtitle">
                      GBC & Namhatta Preaching Minister
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Director Card */}
          <Card className="bg-slate-800/50 border-blue-500/30 shadow-xl" data-testid="card-regional-director">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={namhattaLogo} 
                    alt="Namhatta Logo" 
                    className="w-8 h-8 object-contain"
                    data-testid="img-regional-director-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-300 mb-2" data-testid="text-regional-director-title">
                    ISKCON Namhatta Regional Directors
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-lg font-semibold text-blue-200" data-testid="text-regional-director-name-1">
                        His Holiness Gauranga Prem Swami
                      </p>
                      <p className="text-sm text-blue-300" data-testid="text-regional-director-subtitle-1">
                        ISKCON Namhatta Regional Director
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-200" data-testid="text-regional-director-name-2">
                        His Holiness Bhaktivilasa Gaurochandra Swami
                      </p>
                      <p className="text-sm text-blue-300" data-testid="text-regional-director-subtitle-2">
                        ISKCON Namhatta Regional Director
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Co-Regional Director Card */}
          <Card className="bg-slate-800/50 border-teal-500/30 shadow-xl" data-testid="card-co-regional-director">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={namhattaLogo} 
                    alt="Namhatta Logo" 
                    className="w-8 h-8 object-contain"
                    data-testid="img-co-regional-director-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-300 mb-2" data-testid="text-co-regional-director-title">
                    Co-Regional Director
                  </h3>
                  <div>
                    <p className="text-lg font-semibold text-teal-200" data-testid="text-co-regional-director-name">
                      His Grace Padmananda Das
                    </p>
                    <p className="text-sm text-teal-300" data-testid="text-co-regional-director-subtitle">
                      Co-Regional Director
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}