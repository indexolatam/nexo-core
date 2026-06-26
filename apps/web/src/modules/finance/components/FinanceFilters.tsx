import { Button, Checkbox, DatePicker, InputNumber, Select } from "antd";
import type { Dispatch, SetStateAction } from "react";
import type { FinanceFilterState, PaymentMethod, PaymentStatus } from "../../../types/adminFinance";
import { paymentMethods, paymentStatuses } from "../../../types/adminFinance";

const serviceOptions: string[] = [];

interface FinanceFiltersProps {
  tempFilters: FinanceFilterState;
  setTempFilters: Dispatch<SetStateAction<FinanceFilterState>>;
  onApply: () => void;
  onClear: () => void;
}

export function FinanceFilters({ tempFilters, setTempFilters, onApply, onClear }: FinanceFiltersProps) {
  return (
    <div className="w-[340px] space-y-4 p-1">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Estado</p>
        <Checkbox.Group
          className="mt-3 flex flex-col gap-2"
          value={tempFilters.estado}
          onChange={(checked) => setTempFilters((prev) => ({ ...prev, estado: checked as PaymentStatus[] }))}
          options={paymentStatuses.map((s) => ({ label: s, value: s }))}
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Método de pago</p>
        <Checkbox.Group
          className="mt-3 flex flex-col gap-2"
          value={tempFilters.metodo}
          onChange={(checked) => setTempFilters((prev) => ({ ...prev, metodo: checked as PaymentMethod[] }))}
          options={paymentMethods.map((m) => ({ label: m, value: m }))}
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Rango de fecha</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            placeholder="Desde"
            onChange={(_, dateString) => setTempFilters((prev) => ({ ...prev, fecha_desde: Array.isArray(dateString) ? dateString[0] ?? "" : dateString }))}
          />
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            placeholder="Hasta"
            onChange={(_, dateString) => setTempFilters((prev) => ({ ...prev, fecha_hasta: Array.isArray(dateString) ? dateString[0] ?? "" : dateString }))}
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Tipo de servicio</p>
        <Select
          allowClear
          className="mt-3 w-full"
          placeholder="Seleccionar servicio"
          value={tempFilters.servicio || undefined}
          options={serviceOptions.map((s) => ({ value: s, label: s }))}
          onChange={(value) => setTempFilters((prev) => ({ ...prev, servicio: value ?? "" }))}
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Monto</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <InputNumber
            className="w-full"
            placeholder="Mín"
            min={0}
            value={tempFilters.monto_min ? Number(tempFilters.monto_min) : undefined}
            onChange={(value) => setTempFilters((prev) => ({ ...prev, monto_min: value?.toString() ?? "" }))}
            prefix="$"
          />
          <InputNumber
            className="w-full"
            placeholder="Máx"
            min={0}
            value={tempFilters.monto_max ? Number(tempFilters.monto_max) : undefined}
            onChange={(value) => setTempFilters((prev) => ({ ...prev, monto_max: value?.toString() ?? "" }))}
            prefix="$"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button className="rounded-button" onClick={onClear}>
          Limpiar
        </Button>
        <Button type="primary" className="rounded-button" onClick={onApply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
