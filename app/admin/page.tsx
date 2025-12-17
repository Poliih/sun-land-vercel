'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTrash, 
  faSignOutAlt, 
  faEye, 
  faMapMarkerAlt, 
  faUsers, 
  faHome, 
  faSearch, 
  faFilter,
  faPen,
  faUser,
  faHeart,
  faCheck,
  faTimes,
  faPlus,
  faBriefcase,
  faGraduationCap,
  faSave
} from '@fortawesome/free-solid-svg-icons'

import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
config.autoAddCss = false

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder-key'
const supabase = createClient(supabaseUrl, supabaseKey)

const InputGroup = ({ label, type = "text", value, onChange, placeholder = "" }: any) => (
  <div className="flex flex-col group w-full">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="bg-gray-50 text-gray-900 text-sm rounded-xl block w-full p-3 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" placeholder={placeholder} />
  </div>
)

const CheckboxGroup = ({ label, checked, onChange, icon = null }: any) => (
  <label className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${checked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
    <div className={`w-5 h-5 rounded flex items-center justify-center border ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
      {checked && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
    </div>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
    <span className={`text-sm font-medium flex items-center gap-2 ${checked ? 'text-indigo-900' : 'text-gray-600'}`}>
      {icon && <FontAwesomeIcon icon={icon} className={checked ? "text-indigo-600" : "text-gray-400"} />} {label}
    </span>
  </label>
)

const EditModal = ({ familia, onClose, onUpdate }: any) => {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    pai: { 
      nome: familia.pai_nome || '', nasc: familia.pai_nasc || '', idade: familia.pai_idade || '', telefone: familia.pai_telefone || '', 
      conjugal: familia.pai_conjugal || 'Casado', mora: familia.pai_mora, endereco_extra: familia.pai_endereco || '', 
      trabalha: familia.pai_trabalha, profissao: familia.pai_profissao || '', renda: familia.pai_renda || '' 
    },
    mae: { 
      nome: familia.mae_nome || '', nasc: familia.mae_nasc || '', idade: familia.mae_idade || '', telefone: familia.mae_telefone || '', 
      conjugal: familia.mae_conjugal || 'Casado', mora: familia.mae_mora, endereco_extra: familia.mae_endereco || '', 
      trabalha: familia.mae_trabalha, profissao: familia.mae_profissao || '', renda: familia.mae_renda || '' 
    },
    endereco: { 
      rua: familia.rua || '', numero: familia.numero || '', complemento: familia.complemento || '', 
      bairro: familia.bairro || '', referencia: familia.referencia || '', tipo_moradia: familia.tipo_moradia || 'Própria' 
    },
    filhos: familia.filhos || [],
    observacoes: familia.observacoes || ''
  })

  const handleChange = (section: string, field: string, value: any, index?: number) => {
    if (section === 'filhos' && index !== undefined) {
      const novosFilhos = [...formData.filhos]
      novosFilhos[index] = { ...novosFilhos[index], [field]: value }
      setFormData({ ...formData, filhos: novosFilhos })
    } else if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }))
    }
  }

  const addFilho = () => {
    setFormData({ ...formData, filhos: [...formData.filhos, { nome: '', nasc: '', idade: '', mora: true, estuda: false, serie: '', documento: false }] })
  }

  const removeFilho = (index: number) => {
    setFormData({ ...formData, filhos: formData.filhos.filter((_: any, i: number) => i !== index) })
  }

  const handleUpdate = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('checkin_familia').update({
        pai_nome: formData.pai.nome, pai_nasc: formData.pai.nasc || null, pai_idade: formData.pai.idade ? parseInt(String(formData.pai.idade)) : null,
        pai_telefone: formData.pai.telefone, pai_conjugal: formData.pai.conjugal, pai_mora: formData.pai.mora,
        pai_endereco: !formData.pai.mora ? formData.pai.endereco_extra : null, pai_trabalha: formData.pai.trabalha,
        pai_profissao: formData.pai.trabalha ? formData.pai.profissao : null, pai_renda: (formData.pai.trabalha && formData.pai.renda) ? parseFloat(String(formData.pai.renda)) : null,
        
        mae_nome: formData.mae.nome, mae_nasc: formData.mae.nasc || null, mae_idade: formData.mae.idade ? parseInt(String(formData.mae.idade)) : null,
        mae_telefone: formData.mae.telefone, mae_conjugal: formData.mae.conjugal, mae_mora: formData.mae.mora,
        mae_endereco: !formData.mae.mora ? formData.mae.endereco_extra : null, mae_trabalha: formData.mae.trabalha,
        mae_profissao: formData.mae.trabalha ? formData.mae.profissao : null, mae_renda: (formData.mae.trabalha && formData.mae.renda) ? parseFloat(String(formData.mae.renda)) : null,

        rua: formData.endereco.rua, numero: formData.endereco.numero, complemento: formData.endereco.complemento,
        bairro: formData.endereco.bairro, referencia: formData.endereco.referencia, tipo_moradia: formData.endereco.tipo_moradia,
        
        filhos: formData.filhos, observacoes: formData.observacoes
      }).eq('id', familia.id)

      if (error) throw error
      
      await Swal.fire({ title: 'Atualizado!', text: 'Dados salvos com sucesso.', icon: 'success', timer: 2000, showConfirmButton: false })
      onUpdate() 
      onClose() 
    } catch (error: any) {
      Swal.fire('Erro', error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn text-gray-900">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">Editar Cadastro #{familia.id}</h2>
          <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition"><FontAwesomeIcon icon={faTimes} /></button>
        </div>
        
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <h3 className="font-bold text-indigo-700 mb-3 flex items-center gap-2"><FontAwesomeIcon icon={faUser} /> Pai</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Nome" value={formData.pai.nome} onChange={(v:any) => handleChange('pai', 'nome', v)} />
              <InputGroup label="Telefone" value={formData.pai.telefone} onChange={(v:any) => handleChange('pai', 'telefone', v)} />
              <div className="md:col-span-2 flex flex-wrap gap-3">
                 <CheckboxGroup label="Mora na casa?" checked={formData.pai.mora} onChange={(v:any) => handleChange('pai', 'mora', v)} />
                 <CheckboxGroup label="Trabalha?" icon={faBriefcase} checked={formData.pai.trabalha} onChange={(v:any) => handleChange('pai', 'trabalha', v)} />
              </div>
              {!formData.pai.mora && <InputGroup label="Endereço Extra" value={formData.pai.endereco_extra} onChange={(v:any) => handleChange('pai', 'endereco_extra', v)} />}
              {formData.pai.trabalha && (
                <>
                  <InputGroup label="Profissão" value={formData.pai.profissao} onChange={(v:any) => handleChange('pai', 'profissao', v)} />
                  <InputGroup label="Renda" value={formData.pai.renda} onChange={(v:any) => handleChange('pai', 'renda', v)} />
                </>
              )}
            </div>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
            <h3 className="font-bold text-pink-700 mb-3 flex items-center gap-2"><FontAwesomeIcon icon={faHeart} /> Mãe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Nome" value={formData.mae.nome} onChange={(v:any) => handleChange('mae', 'nome', v)} />
              <InputGroup label="Telefone" value={formData.mae.telefone} onChange={(v:any) => handleChange('mae', 'telefone', v)} />
              <div className="md:col-span-2 flex flex-wrap gap-3">
                 <CheckboxGroup label="Mora na casa?" checked={formData.mae.mora} onChange={(v:any) => handleChange('mae', 'mora', v)} />
                 <CheckboxGroup label="Trabalha?" icon={faBriefcase} checked={formData.mae.trabalha} onChange={(v:any) => handleChange('mae', 'trabalha', v)} />
              </div>
              {!formData.mae.mora && <InputGroup label="Endereço Extra" value={formData.mae.endereco_extra} onChange={(v:any) => handleChange('mae', 'endereco_extra', v)} />}
              {formData.mae.trabalha && (
                <>
                  <InputGroup label="Profissão" value={formData.mae.profissao} onChange={(v:any) => handleChange('mae', 'profissao', v)} />
                  <InputGroup label="Renda" value={formData.mae.renda} onChange={(v:any) => handleChange('mae', 'renda', v)} />
                </>
              )}
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
             <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2"><FontAwesomeIcon icon={faHome} /> Endereço</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-2"><InputGroup label="Rua" value={formData.endereco.rua} onChange={(v:any) => handleChange('endereco', 'rua', v)} /></div>
               <InputGroup label="Número" value={formData.endereco.numero} onChange={(v:any) => handleChange('endereco', 'numero', v)} />
               <InputGroup label="Bairro" value={formData.endereco.bairro} onChange={(v:any) => handleChange('endereco', 'bairro', v)} />
               <div className="md:col-span-2"><InputGroup label="Complemento" value={formData.endereco.complemento} onChange={(v:any) => handleChange('endereco', 'complemento', v)} /></div>
             </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
             <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-amber-700 flex items-center gap-2"><FontAwesomeIcon icon={faUsers} /> Filhos ({formData.filhos.length})</h3>
                <button type="button" onClick={addFilho} className="text-xs bg-amber-200 text-amber-800 px-3 py-1 rounded hover:bg-amber-300 transition font-bold"><FontAwesomeIcon icon={faPlus} /> Adicionar</button>
             </div>
             <div className="space-y-3">
                {formData.filhos.map((filho: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded border border-amber-200 flex flex-col gap-3 relative">
                     <button type="button" onClick={() => removeFilho(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><FontAwesomeIcon icon={faTimes} /></button>
                     <div className="grid grid-cols-2 gap-3 pr-6">
                        <InputGroup label="Nome" value={filho.nome} onChange={(v:any) => handleChange('filhos', 'nome', v, idx)} />
                        <InputGroup label="Idade" type="number" value={filho.idade} onChange={(v:any) => handleChange('filhos', 'idade', v, idx)} />
                     </div>
                     <div className="flex gap-3">
                       <CheckboxGroup label="Estuda?" icon={faGraduationCap} checked={filho.estuda} onChange={(v:any) => handleChange('filhos', 'estuda', v, idx)} />
                       {filho.estuda && <div className="flex-1"><InputGroup label="Série" value={filho.serie} onChange={(v:any) => handleChange('filhos', 'serie', v, idx)} /></div>}
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <InputGroup label="Observações Gerais" value={formData.observacoes} onChange={(v:any) => handleChange('root', 'observacoes', v)} />

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2">
              {loading ? 'Salvando...' : <><FontAwesomeIcon icon={faSave} /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [familias, setFamilias] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingFamilia, setEditingFamilia] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login') 
      else fetchData()
    }
    checkUser()
  }, [])

  const fetchData = async () => {
    const { data, error } = await supabase.from('checkin_familia').select('*').order('created_at', { ascending: false }) 
    if (error) Swal.fire('Erro', 'Erro ao carregar dados.', 'error')
    else {
      setFamilias(data || [])
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Tem certeza?', text: "Essa ação é irreversível.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sim, apagar'
    })
    if (result.isConfirmed) {
      const { error } = await supabase.from('checkin_familia').delete().eq('id', id)
      if (error) Swal.fire('Erro!', 'Permissão negada.', 'error')
      else {
        Swal.fire('Deletado!', 'Registro removido.', 'success')
        fetchData()
      }
    }
  }

  const showDetails = (familia: any) => {
    let filhosHtml = `
      <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
         <p class="text-gray-400 italic text-sm">Nenhum filho cadastrado.</p>
      </div>
    `
    
    if (familia.filhos && familia.filhos.length > 0) {
      filhosHtml = familia.filhos.map((f: any, index: number) => `
        <div class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm mb-2 hover:border-amber-200 transition-colors">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                ${index + 1}
             </div>
             <div class="text-left">
                <p class="font-bold text-gray-800 text-sm">${f.nome}</p>
                <p class="text-xs text-gray-500">${f.idade} anos • ${f.serie || 'Série não inf.'}</p>
             </div>
          </div>
          <div class="text-right">
             ${f.estuda ? '<span class="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">Estuda</span>' : ''}
             ${!f.mora ? '<span class="inline-block px-2 py-0.5 bg-red-50 text-red-500 rounded text-[10px] font-bold border border-red-100 ml-1">Não mora</span>' : ''}
          </div>
        </div>
      `).join('')
    }

    const paiHtml = `
      <div class="flex-1 bg-white border border-indigo-50 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
         <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
         <h4 class="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            Pai
         </h4>
         <p class="font-bold text-gray-800 text-lg leading-tight mb-1">
            ${familia.pai_nome || '<span class="text-gray-300">Não informado</span>'}
         </p>
         <p class="text-sm text-gray-500 mb-2">📞 ${familia.pai_telefone || '-'}</p>
         <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
            ${familia.pai_trabalha ? `💼 ${familia.pai_profissao}` : 'Sem trabalho declarado'}
         </div>
         ${familia.pai_endereco ? `<div class="mt-2 text-[10px] text-red-500 bg-red-50 p-1 rounded px-2 border border-red-100">📍 ${familia.pai_endereco}</div>` : ''}
      </div>
    `

    const maeHtml = `
      <div class="flex-1 bg-white border border-pink-50 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
         <div class="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
         <h4 class="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            Mãe
         </h4>
         <p class="font-bold text-gray-800 text-lg leading-tight mb-1">
            ${familia.mae_nome || '<span class="text-gray-300">Não informado</span>'}
         </p>
         <p class="text-sm text-gray-500 mb-2">📞 ${familia.mae_telefone || '-'}</p>
         <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
            ${familia.mae_trabalha ? `💼 ${familia.mae_profissao}` : 'Sem trabalho declarado'}
         </div>
         ${familia.mae_endereco ? `<div class="mt-2 text-[10px] text-red-500 bg-red-50 p-1 rounded px-2 border border-red-100">📍 ${familia.mae_endereco}</div>` : ''}
      </div>
    `

    Swal.fire({
      html: `
        <div class="text-left">
          <h2 class="text-2xl font-bold text-gray-800 mb-1 text-center">Ficha da Família</h2>
          <p class="text-center text-xs text-gray-400 mb-6 uppercase tracking-widest">ID #${familia.id} • Cadastrado em ${new Date(familia.created_at).toLocaleDateString('pt-BR')}</p>

          <div class="flex flex-col sm:flex-row gap-4 mb-6">
             ${paiHtml}
             ${maeHtml}
          </div>

          <div class="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-6 relative">
             <div class="flex items-start gap-4">
                <div class="bg-white p-2 rounded-xl shadow-sm text-emerald-500 text-xl">
                   <span style="font-size: 1.5em;">🏠</span>
                </div>
                <div>
                   <h4 class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Endereço Principal</h4>
                   <p class="text-gray-800 font-bold text-base">
                      ${familia.rua}, ${familia.numero}
                   </p>
                   <p class="text-sm text-gray-500">
                      ${familia.bairro} ${familia.complemento ? `• ${familia.complemento}` : ''}
                   </p>
                   <div class="mt-2 flex gap-2">
                      <span class="text-[10px] uppercase font-bold bg-white text-emerald-700 px-2 py-1 rounded border border-emerald-200">
                         ${familia.tipo_moradia || 'Moradia Ñ Inf.'}
                      </span>
                      ${familia.referencia ? `<span class="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded">Ref: ${familia.referencia}</span>` : ''}
                   </div>
                </div>
             </div>
             ${familia.foto_casa_url ? `
                <div class="mt-4 pt-4 border-t border-emerald-100">
                   <img src="${familia.foto_casa_url}" class="w-full h-48 object-cover rounded-xl shadow-sm" />
                </div>
             ` : ''}
          </div>

          <div class="mb-6">
             <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Filhos Cadastrados</h4>
             <div class="bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                ${filhosHtml}
             </div>
          </div>

          ${familia.observacoes ? `
            <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-900 relative">
               <span class="absolute -top-2 left-4 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-200 uppercase">Observações</span>
               ${familia.observacoes}
            </div>
          ` : ''}

        </div>
      `,
      width: 750,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Fechar Ficha',
      confirmButtonColor: '#1f2937', 
      padding: '2rem',
      customClass: {
        popup: 'rounded-3xl shadow-2xl'
      }
    })
  }

  const filteredFamilias = familias.filter((f: any) => {
    const normalize = (text: string) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ""
    const term = normalize(searchTerm)

    const matchPai = normalize(f.pai_nome).includes(term)
    const matchMae = normalize(f.mae_nome).includes(term)
    const matchBairro = normalize(f.bairro).includes(term)
    const matchMoradia = normalize(f.tipo_moradia).includes(term)
    
    const matchFilhos = f.filhos?.some((filho: any) => normalize(filho.nome).includes(term))

    return matchPai || matchMae || matchBairro || matchMoradia || matchFilhos
  })

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold animate-pulse">Carregando...</div>

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 pb-10">
      
      {editingFamilia && (
        <EditModal 
          familia={editingFamilia} 
          onClose={() => setEditingFamilia(null)} 
          onUpdate={fetchData} 
        />
      )}

      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
           <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"><FontAwesomeIcon icon={faUsers} /></div>
           <div><h1 className="font-bold text-xl text-gray-800">Painel Administrativo</h1><p className="text-xs text-gray-500">Terra do Sol</p></div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-grow md:flex-grow-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FontAwesomeIcon icon={faSearch} /></div>
              <input type="text" placeholder="Buscar por pai, mãe, filho ou bairro..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full md:w-80 focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           <button onClick={handleLogout} className="bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><FontAwesomeIcon icon={faSignOutAlt} /> Sair</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-end mb-6">
           <div><h2 className="text-2xl font-bold text-gray-800">Cadastros</h2><p className="text-gray-500 text-sm">Total encontrado: {filteredFamilias.length}</p></div>
           <button onClick={fetchData} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg"><FontAwesomeIcon icon={faFilter} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFamilias.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all group">
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {item.foto_casa_url ? <img src={item.foto_casa_url} alt="Casa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><FontAwesomeIcon icon={faHome} className="text-4xl opacity-30" /></div>}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm"><p className="text-gray-800 text-xs font-bold"><FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-500 mr-1" /> {item.bairro || '?'}</p></div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 truncate" title={item.pai_nome}>{item.pai_nome ? item.pai_nome.split(' ')[0] : 'Pai N/A'} & {item.mae_nome ? item.mae_nome.split(' ')[0] : 'Mãe N/A'}</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => showDetails(item)} className="flex-1 bg-gray-50 text-gray-600 border border-gray-200 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition"><FontAwesomeIcon icon={faEye} /></button>
                  
                  <button 
                    onClick={() => setEditingFamilia(item)} 
                    className="flex-1 bg-indigo-50 text-indigo-600 border border-indigo-100 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPen} /> Editar
                  </button>

                  <button onClick={() => handleDelete(item.id)} className="w-10 bg-white text-red-400 border border-red-100 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition"><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}