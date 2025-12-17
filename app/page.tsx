'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid' 
import Swal from 'sweetalert2' 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUser, 
  faHeart, 
  faHome, 
  faUsers, 
  faPlus, 
  faCheck, 
  faSave, 
  faCamera,
  faClipboardList,
  faBriefcase,
  faGraduationCap,
  faTimes,
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons'

import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
config.autoAddCss = false

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY! 
)

const InputGroup = ({ label, type = "text", value, onChange, placeholder = "" }: any) => (
  <div className="flex flex-col group animate-fadeIn w-full">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-600">
      {label}
    </label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="bg-gray-50 text-gray-900 text-sm rounded-xl block w-full p-3 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm placeholder-gray-400"
      placeholder={placeholder}
    />
  </div>
)

const SelectGroup = ({ label, value, onChange, options }: any) => (
  <div className="flex flex-col group w-full">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-600">
      {label}
    </label>
    <div className="relative">
      <select 
        value={value}
        onChange={onChange}
        className="bg-gray-50 text-gray-900 text-sm rounded-xl block w-full p-3 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm appearance-none"
      >
        {options.map((opt: string) => <option key={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
)

const CheckboxGroup = ({ label, checked, onChange, icon = null }: any) => (
  <label className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer h-full select-none ${checked ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
    <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
      {checked && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
    </div>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
    <span className={`text-sm font-medium flex items-center gap-2 ${checked ? 'text-indigo-900' : 'text-gray-600'}`}>
      {icon && <FontAwesomeIcon icon={icon} className={checked ? "text-indigo-600" : "text-gray-400"} />}
      {label}
    </span>
  </label>
)

const SectionHeader = ({ icon, title, colorClass }: any) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${colorClass} text-white shadow-sm`}>
      <FontAwesomeIcon icon={icon} className="text-lg" />
    </div>
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
  </div>
)


export default function CheckinForm() {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    pai: { nome: '', nasc: '', idade: '', telefone: '', conjugal: 'Casado', mora: true, endereco_extra: '', trabalha: false, profissao: '', renda: '' },
    mae: { nome: '', nasc: '', idade: '', telefone: '', conjugal: 'Casado', mora: true, endereco_extra: '', trabalha: false, profissao: '', renda: '' },
    endereco: { rua: '', numero: '', complemento: '', bairro: '', referencia: '', tipo_moradia: 'Própria' },
    filhos: [] as any[], 
    observacoes: ''
  })

  const [fotoCasa, setFotoCasa] = useState<File | null>(null)
  
  const addFilho = () => {
    setFormData({
      ...formData,
      filhos: [...formData.filhos, { nome: '', nasc: '', idade: '', mora: true, estuda: false, serie: '', documento: false }]
    })
  }

  const removeFilho = (indexToRemove: number) => {
    const novosFilhos = formData.filhos.filter((_, index) => index !== indexToRemove)
    setFormData({ ...formData, filhos: novosFilhos })
  }

  const removeFoto = (e: any) => {
    e.preventDefault() 
    e.stopPropagation() 
    setFotoCasa(null)
  }

  const handleChange = (section: string, field: string, value: any, index?: number) => {
    if (section === 'filhos' && index !== undefined) {
      const novosFilhos = [...formData.filhos]
      novosFilhos[index] = { ...novosFilhos[index], [field]: value }
      setFormData({ ...formData, filhos: novosFilhos })
    } else if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...(prev as any)[section], [field]: value }
      }))
    }
  }

  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}-${uuidv4()}.${fileExt}`
    const { error } = await supabase.storage.from('fotos-checkin').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('fotos-checkin').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      let fotoCasaUrl = ''
      if (fotoCasa) fotoCasaUrl = await uploadImage(fotoCasa, 'casa')

      const { error } = await supabase.from('checkin_familia').insert([{
        pai_nome: formData.pai.nome,
        pai_nasc: formData.pai.nasc || null,
        pai_idade: formData.pai.idade ? parseInt(formData.pai.idade) : null,
        pai_telefone: formData.pai.telefone,
        pai_conjugal: formData.pai.conjugal,
        pai_mora: formData.pai.mora,
        pai_endereco: !formData.pai.mora ? formData.pai.endereco_extra : null,
        pai_trabalha: formData.pai.trabalha,
        pai_profissao: formData.pai.trabalha ? formData.pai.profissao : null, 
        pai_renda: (formData.pai.trabalha && formData.pai.renda) ? parseFloat(formData.pai.renda) : null,
        
        mae_nome: formData.mae.nome,
        mae_nasc: formData.mae.nasc || null,
        mae_idade: formData.mae.idade ? parseInt(formData.mae.idade) : null,
        mae_telefone: formData.mae.telefone,
        mae_conjugal: formData.mae.conjugal,
        mae_mora: formData.mae.mora,
        mae_endereco: !formData.mae.mora ? formData.mae.endereco_extra : null,
        mae_trabalha: formData.mae.trabalha,
        mae_profissao: formData.mae.trabalha ? formData.mae.profissao : null,
        mae_renda: (formData.mae.trabalha && formData.mae.renda) ? parseFloat(formData.mae.renda) : null,

        rua: formData.endereco.rua,
        numero: formData.endereco.numero,
        complemento: formData.endereco.complemento,
        bairro: formData.endereco.bairro,
        referencia: formData.endereco.referencia,
        foto_casa_url: fotoCasaUrl,

        filhos: formData.filhos,
        observacoes: `Tipo Moradia: ${formData.endereco.tipo_moradia} \n ${formData.endereco.tipo_moradia}` 
      }])

      if (error) throw error

      await Swal.fire({
        title: 'Sucesso!',
        text: 'O cadastro foi realizado e salvo na base de dados.',
        icon: 'success',
        confirmButtonText: 'Maravilha!',
        confirmButtonColor: '#4f46e5', 
        background: '#ffffff',
        iconColor: '#4f46e5'
      })

      window.location.reload()

    } catch (error: any) {
      console.error(error)
      
      Swal.fire({
        title: 'Ops, algo deu errado!',
        text: error.message || 'Houve um erro ao tentar salvar. Verifique sua conexão.',
        icon: 'error',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#d33',
      })

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                <FontAwesomeIcon icon={faClipboardList} className="text-white text-3xl" />
             </div>
             <h1 className="text-3xl font-extrabold text-white tracking-tight">
               CHECK-IN
             </h1>
             <p className="text-indigo-100 font-medium mt-2">Comunidade Terra do Sol &bull; Base de Dados</p>
          </div>
        </div>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <SectionHeader icon={faUser} title="1. Identificação do Pai" colorClass="bg-indigo-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <InputGroup label="Nome Completo" value={formData.pai.nome} onChange={(v:any) => handleChange('pai', 'nome', v)} placeholder="Ex: João da Silva" />
            <div className="grid grid-cols-2 gap-3">
              <InputGroup label="Nascimento" type="date" value={formData.pai.nasc} onChange={(v:any) => handleChange('pai', 'nasc', v)} />
              <InputGroup label="Idade" type="number" value={formData.pai.idade} onChange={(v:any) => handleChange('pai', 'idade', v)} />
            </div>
            <InputGroup label="Telefone / WhatsApp" value={formData.pai.telefone} onChange={(v:any) => handleChange('pai', 'telefone', v)} placeholder="(00) 00000-0000" />
            <SelectGroup 
              label="Situação Conjugal" 
              value={formData.pai.conjugal} 
              onChange={(e:any) => handleChange('pai', 'conjugal', e.target.value)} 
              options={['Casado', 'Separado', 'União Estável', 'Solteiro', 'Viúvo']}
            />
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
               <CheckboxGroup label="Mora na residência (com a criança)?" checked={formData.pai.mora} onChange={(v:any) => handleChange('pai', 'mora', v)} />
               <CheckboxGroup label="Possui trabalho?" icon={faBriefcase} checked={formData.pai.trabalha} onChange={(v:any) => handleChange('pai', 'trabalha', v)} />
            </div>

            {!formData.pai.mora && (
               <div className="animate-pulse-once border-t border-indigo-100 pt-4 md:border-t-0 md:pt-0">
                  <div className="flex items-center gap-2 mb-2 text-indigo-700 text-sm font-bold">
                     <FontAwesomeIcon icon={faMapMarkerAlt} />
                     <span>Endereço Atual do Pai</span>
                  </div>
                  <InputGroup 
                    label="Endereço Completo (Rua, Nº, Bairro)" 
                    value={formData.pai.endereco_extra} 
                    onChange={(v:any) => handleChange('pai', 'endereco_extra', v)} 
                    placeholder="Ex: Rua A, 123, Centro" 
                  />
               </div>
            )}

            {formData.pai.trabalha && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse-once border-t border-indigo-100 pt-4 md:border-t-0 md:pt-0">
                <InputGroup label="Profissão" value={formData.pai.profissao} onChange={(v:any) => handleChange('pai', 'profissao', v)} />
                <InputGroup label="Renda Mensal (R$)" type="number" value={formData.pai.renda} onChange={(v:any) => handleChange('pai', 'renda', v)} placeholder="0,00" />
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
          <SectionHeader icon={faHeart} title="2. Identificação da Mãe" colorClass="bg-pink-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <InputGroup label="Nome Completo" value={formData.mae.nome} onChange={(v:any) => handleChange('mae', 'nome', v)} placeholder="Ex: Maria da Silva" />
            <div className="grid grid-cols-2 gap-3">
              <InputGroup label="Nascimento" type="date" value={formData.mae.nasc} onChange={(v:any) => handleChange('mae', 'nasc', v)} />
              <InputGroup label="Idade" type="number" value={formData.mae.idade} onChange={(v:any) => handleChange('mae', 'idade', v)} />
            </div>
            <InputGroup label="Telefone / WhatsApp" value={formData.mae.telefone} onChange={(v:any) => handleChange('mae', 'telefone', v)} placeholder="(00) 00000-0000" />
            <SelectGroup 
              label="Situação Conjugal" 
              value={formData.mae.conjugal} 
              onChange={(e:any) => handleChange('mae', 'conjugal', e.target.value)} 
              options={['Casado', 'Separado', 'União Estável', 'Solteiro', 'Viúvo']}
            />
          </div>

          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
               <CheckboxGroup label="Mora na residência (com a criança)?" checked={formData.mae.mora} onChange={(v:any) => handleChange('mae', 'mora', v)} />
               <CheckboxGroup label="Possui trabalho?" icon={faBriefcase} checked={formData.mae.trabalha} onChange={(v:any) => handleChange('mae', 'trabalha', v)} />
            </div>

            {!formData.mae.mora && (
               <div className="animate-pulse-once border-t border-pink-100 pt-4 md:border-t-0 md:pt-0">
                  <div className="flex items-center gap-2 mb-2 text-pink-700 text-sm font-bold">
                     <FontAwesomeIcon icon={faMapMarkerAlt} />
                     <span>Endereço Atual da Mãe</span>
                  </div>
                  <InputGroup 
                    label="Endereço Completo (Rua, Nº, Bairro)" 
                    value={formData.mae.endereco_extra} 
                    onChange={(v:any) => handleChange('mae', 'endereco_extra', v)} 
                    placeholder="Ex: Rua B, 456, Centro" 
                  />
               </div>
            )}

            {formData.mae.trabalha && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-pink-100 pt-4 md:border-t-0 md:pt-0">
                <InputGroup label="Profissão" value={formData.mae.profissao} onChange={(v:any) => handleChange('mae', 'profissao', v)} />
                <InputGroup label="Renda Mensal (R$)" type="number" value={formData.mae.renda} onChange={(v:any) => handleChange('mae', 'renda', v)} placeholder="0,00" />
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <SectionHeader icon={faHome} title="3. Endereço Completo" colorClass="bg-emerald-500" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <InputGroup label="Rua / Logradouro" value={formData.endereco.rua} onChange={(v:any) => handleChange('endereco', 'rua', v)} />
            </div>
            <InputGroup label="Número" value={formData.endereco.numero} onChange={(v:any) => handleChange('endereco', 'numero', v)} />
            <InputGroup label="Complemento" value={formData.endereco.complemento} onChange={(v:any) => handleChange('endereco', 'complemento', v)} placeholder="Apto, Bloco, etc" />
            <InputGroup label="Bairro" value={formData.endereco.bairro} onChange={(v:any) => handleChange('endereco', 'bairro', v)} />
            <InputGroup label="Ponto de Referência" value={formData.endereco.referencia} onChange={(v:any) => handleChange('endereco', 'referencia', v)} />
            
            <div className="md:col-span-1">
               <SelectGroup 
                  label="Tipo de Residência" 
                  value={formData.endereco.tipo_moradia} 
                  onChange={(e:any) => handleChange('endereco', 'tipo_moradia', e.target.value)} 
                  options={['Própria', 'Alugada', 'Cedida / Favor', 'Invasão', 'Outros']}
                />
            </div>
          </div>
          
          <div className="mt-6">
            {!fotoCasa ? (
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center hover:bg-gray-100 transition-colors">
                <label className="cursor-pointer block">
                  <span className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Foto da Fachada da Casa</span>
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-gray-200">
                     <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-xl" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFotoCasa(e.target.files?.[0] || null)} 
                    className="hidden" 
                  />
                  <span className="text-emerald-600 font-bold hover:underline">Clique para enviar foto</span>
                  <p className="text-xs text-gray-400 mt-1">Nenhum arquivo selecionado</p>
                </label>
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between relative">
                 <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center">
                       <FontAwesomeIcon icon={faCamera} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Foto Selecionada</p>
                      <p className="text-xs text-emerald-600 truncate max-w-[200px]">{fotoCasa.name}</p>
                    </div>
                 </div>
                 <button 
                   type="button" 
                   onClick={removeFoto} 
                   className="bg-white text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors border border-red-100"
                   title="Remover foto"
                 >
                   <FontAwesomeIcon icon={faTimes} />
                 </button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                   <FontAwesomeIcon icon={faUsers} className="text-lg" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">4. Filhos</h2>
             </div>
             <button type="button" onClick={addFilho} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-100 transition shadow-sm border border-amber-200">
                <FontAwesomeIcon icon={faPlus} /> 
                <span>Adicionar</span>
             </button>
          </div>
          
          {formData.filhos.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">Nenhum filho cadastrado ainda.</p>
              <p className="text-gray-300 text-xs mt-1">Clique no botão acima para adicionar.</p>
            </div>
          )}

          <div className="space-y-6">
            {formData.filhos.map((filho, index) => (
              <div key={index} className="p-5 bg-gray-50 rounded-xl border border-gray-200 relative group hover:border-amber-200 transition-colors">
                
                <div className="absolute -top-3 left-4 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-sm uppercase tracking-wide">
                  Filho #{index + 1}
                </div>

                <button
                  type="button"
                  onClick={() => removeFilho(index)}
                  className="absolute -top-3 right-4 bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white px-2 py-1 rounded-full shadow-sm transition-all text-xs flex items-center gap-1"
                  title="Remover este filho"
                >
                  <FontAwesomeIcon icon={faTimes} /> Remover
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3 mb-4">
                   <InputGroup label="Nome Completo" value={filho.nome} onChange={(v:any) => handleChange('filhos', 'nome', v, index)} />
                   <div className="grid grid-cols-2 gap-3">
                     <InputGroup label="Nascimento" type="date" value={filho.nasc} onChange={(v:any) => handleChange('filhos', 'nasc', v, index)} />
                     <InputGroup label="Idade" type="number" value={filho.idade} onChange={(v:any) => handleChange('filhos', 'idade', v, index)} />
                   </div>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <CheckboxGroup label="Mora aqui?" checked={filho.mora} onChange={(v:any) => handleChange('filhos', 'mora', v, index)} />
                    <CheckboxGroup label="Possui Documento?" checked={filho.documento} onChange={(v:any) => handleChange('filhos', 'documento', v, index)} />
                    <CheckboxGroup label="Estuda?" icon={faGraduationCap} checked={filho.estuda} onChange={(v:any) => handleChange('filhos', 'estuda', v, index)} />
                  </div>

                  {filho.estuda && (
                    <div className="animate-pulse-once border-t border-amber-100 pt-4 md:border-t-0 md:pt-0">
                       <InputGroup label="Série / Ano Escolar" value={filho.serie} onChange={(v:any) => handleChange('filhos', 'serie', v, index)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">Observações Gerais</label>
          <textarea 
            rows={4}
            value={formData.observacoes}
            onChange={(e) => handleChange('root', 'observacoes', e.target.value)}
            className="w-full bg-gray-50 text-gray-900 border-0 ring-1 ring-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all placeholder-gray-400"
            placeholder="Digite qualquer informação adicional importante sobre a família..."
          />
        </section>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99] flex justify-center items-center gap-2"
        >
          {loading ? (
            <>Salvando...</>
          ) : (
             <>
               <FontAwesomeIcon icon={faSave} />
               <span>SALVAR CHECK-IN</span>
             </>
          )}
        </button>

      </form>
    </div>
  )
}