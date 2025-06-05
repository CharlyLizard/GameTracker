import type { RegistroPayload } from "../../models/payload/RegistroPayload";

function validarEmail(email: string): boolean {
  // Expresión regular simple para validar email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const API_URL = "http://localhost:5000/api/auth";

const AuthService = {
  async registrarUsuario(data: RegistroPayload): Promise<any> {
    // Validaciones frontend
    if (!data.nombre || data.nombre.trim().length < 2) {
      throw new Error("El nombre es obligatorio y debe tener al menos 2 caracteres.");
    }
    if (!data.nickname || data.nickname.trim().length < 3) {
      throw new Error("El nickname es obligatorio y debe tener al menos 3 caracteres.");
    }
    if (!data.email || !validarEmail(data.email)) {
      throw new Error("El correo electrónico no es válido.");
    }
    if (!data.password || data.password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: data.nombre,
          nickname: data.nickname,
          email: data.email,
          password: data.password,
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar el usuario');
      }

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Error de red');
    }
  },




  async verificarCuenta(token: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/verify?token=${token}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return { ok: true };
      } else {
        return { ok: false, error: data?.error || "El enlace de verificación no es válido o ya ha expirado." };
      }
    } catch (error: any) {
      return { ok: false, error: "Error de conexión: " + error.message };
    }
  },
  async login(email: string, password: string, publicIp?: string): Promise<{ ok: boolean; token?: string; user?: any; error?: string; require2FA?: boolean; userId?: string }> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, publicIp }),
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      if (data.require2FA) {
        return { ok: true, require2FA: true, userId: data.userId };
      }
      return { ok: true, token: data.token, user: data.user };
    } else {
      return { ok: false, error: data?.error || 'Error al iniciar sesión' };
    }
  } catch (error: any) {
    return { ok: false, error: "Error de conexión: " + error.message };
  }
  },
  async setup2FA(token: string): Promise<{ qr: string; secret: string; error?: string }> {
    const res = await fetch(`${API_URL}/2fa/setup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) return { qr: data.qr, secret: data.secret };
    return { qr: "", secret: "", error: data.error || "Error al iniciar 2FA" };
  },
  async verify2FA(token: string, code: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/2fa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: code }),
    });
    const data = await res.json();
    return { ok: !!data.ok, error: data.error };
  },
  async disable2FA(token: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/2fa/disable`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { ok: !!data.ok, error: data.error };
  },
  async verify2FAWithLogin(userId: string, code: string, publicIp?: string): Promise<{ ok: boolean; token?: string; user?: any; error?: string }> {
  const res = await fetch(`${API_URL}/2fa/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, code, publicIp }),
  });
  const data = await res.json();
  if (res.ok && data.token && data.user) {
    return { ok: true, token: data.token, user: data.user };
  }
  return { ok: false, error: data.error || "Código 2FA incorrecto" };
  },
  async solicitarRecuperacion(email: string): Promise<{ ok: boolean; emailPreviewUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        return { ok: true, emailPreviewUrl: data.emailPreviewUrl };
      } else {
        return { ok: false, error: data.error || "Error al solicitar recuperación" };
      }
    } catch (error: any) {
      return { ok: false, error: error.message || "Error de red" };
    }
  },
  async resetPassword(token: string, password: string, twoFACode?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, twoFACode }),
      });
      const data = await response.json();
      if (response.ok) {
        return { ok: true };
      } else {
        return { ok: false, error: data.error || "No se pudo restablecer la contraseña" };
      }
    } catch (error: any) {
      return { ok: false, error: error.message || "Error de red" };
    }
  },
  async getActiveSessions(token: string): Promise<{ sesiones: any[] }> {
    const res = await fetch(`${API_URL}/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  },  
  async logoutSession(token: string, sessionId: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/sessions/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId })
    });
    return await res.json();
  },
  async logoutAllSessions(token: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/sessions/logout-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  },
  async changePassword(token: string, oldPassword: string, newPassword: string, twoFACode?: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword, twoFACode })
    });
    return await res.json();
  },
  async deleteAccount(token: string, password: string, twoFACode?: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/delete-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password, twoFACode }),
    });
    return await res.json();
  },
  async updateProfile(token: string, formData: FormData): Promise<{ ok: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          // 'Content-Type' se establece automáticamente por el navegador cuando se usa FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        return { ok: true, user: data.user };
      } else {
        return { ok: false, error: data.error || 'Error al actualizar el perfil' };
      }
    } catch (error: any) {
      return { ok: false, error: error.message || 'Error de red al actualizar el perfil' };
    }
  }
};

export default AuthService;