'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faEnvelope, faKey, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      Swal.fire({
        title: 'Acesso Negado',
        text: 'E-mail ou senha incorretos.',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
      setLoading(false)
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
      Toast.fire({
        icon: 'success',
        title: 'Login realizado com sucesso!'
      })
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-8 text-center relative">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-lg">
              <FontAwesomeIcon icon={faLock} className="text-white text-3xl" />
           </div>
           <h1 className="text-2xl font-bold text-white tracking-wide">Área Restrita</h1>
           <p className="text-indigo-100 text-sm mt-1">Apenas administradores autorizados</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-900 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder-gray-400"
                  placeholder="admin@exemplo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faKey} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-900 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
            >
              {loading ? 'Verificando...' : (
                <>
                  Entrar no Sistema <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>

          </form>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
           <p className="text-xs text-gray-400">Sistema Terra do Sol &copy; {new Date().getFullYear()}</p>
        </div>

      </div>
    </div>
  )
}