import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, message, Switch, Tag } from "antd";
import { useState } from "react";
import { useBankConfig } from "../../../context/BankConfigContext";

export function BankManager() {
  const { banks, addBank, removeBank, toggleBank } = useBankConfig();
  const [newBankName, setNewBankName] = useState("");

  const handleAdd = () => {
    const trimmed = newBankName.trim();
    if (!trimmed) { message.warning("Escribe el nombre del banco"); return; }
    const id = trimmed.toLowerCase().replace(/\s+/g, "-");
    if (banks.some((b) => b.id === id)) { message.warning("Ese banco ya está agregado"); return; }
    addBank(newBankName);
    setNewBankName("");
    message.success("Banco agregado");
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="flex gap-3">
        <Input value={newBankName} onChange={(e) => setNewBankName(e.target.value)} placeholder="Nuevo banco (ej: BANPRO)" className="max-w-xs rounded-button" onPressEnter={handleAdd} />
        <Button icon={<PlusOutlined />} className="rounded-button" onClick={handleAdd}>Agregar</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {banks.map((bank) => (
          <div key={bank.id} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${bank.active ? "border-[var(--border-subtle)]" : "border-dashed border-[var(--border-subtle)]/50 opacity-60"}`}>
            <div className="flex items-center gap-3">
              <Switch checked={bank.active} onChange={() => toggleBank(bank.id)} size="small" />
              <div>
                <p className={`text-sm font-semibold ${bank.active ? "text-surface-main" : "text-surface-muted line-through"}`}>{bank.name}</p>
                <Tag className="mt-1 text-[10px]" color={bank.active ? "green" : "default"}>{bank.active ? "Habilitado" : "Deshabilitado"}</Tag>
              </div>
            </div>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeBank(bank.id)} className="text-surface-muted hover:text-red-500" />
          </div>
        ))}
      </div>
      {banks.length === 0 ? <p className="text-sm text-surface-muted">No hay bancos configurados. Agrega al menos uno para usar en Finanzas.</p> : null}
    </div>
  );
}