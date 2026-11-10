import * as React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminAppShell from '@/components/layout/AdminAppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CogIcon, PlusIcon } from '@/components/ui/Icons';

interface CurrencyRecord {
    id: number;
    code: string;
    name: string;
    symbol: string;
    rate: string;
    is_default: boolean;
    is_active: boolean;
    decimal_places: number;
    updated_at: string;
}

interface PricingRuleRecord {
    id: number;
    name: string;
    supplier_id?: number | null;
    service_id?: number | null;
    markup_percentage: string;
    fixed_markup: string;
    is_active: boolean;
    created_at: string;
    supplier?: { id: number; name: string };
    service?: { id: number; name: string; category: string };
}

interface SelectOptionItem {
    id: number;
    name: string;
    category?: string;
}

export default function AdminPricingSettings() {
    const { props } = usePage<any>();
    const currencies: CurrencyRecord[] = props.currencies || [];
    const pricingRules: PricingRuleRecord[] = props.pricingRules || [];
    const suppliers: SelectOptionItem[] = props.suppliers || [];
    const services: SelectOptionItem[] = props.services || [];
    const toast = useToast();

    // Currency Modals State
    const [editCurrency, setEditCurrency] = React.useState<CurrencyRecord | null>(null);
    const [currencyRate, setCurrencyRate] = React.useState('');
    const [currencyActive, setCurrencyActive] = React.useState(true);
    const [savingCurrency, setSavingCurrency] = React.useState(false);

    const [addCurrencyOpen, setAddCurrencyOpen] = React.useState(false);
    const [newCurrencyCode, setNewCurrencyCode] = React.useState('');
    const [newCurrencyName, setNewCurrencyName] = React.useState('');
    const [newCurrencySymbol, setNewCurrencySymbol] = React.useState('');
    const [newCurrencyRate, setNewCurrencyRate] = React.useState('1.00');
    const [newCurrencyDecimals, setNewCurrencyDecimals] = React.useState('2');
    const [creatingCurrency, setCreatingCurrency] = React.useState(false);

    // Pricing Rule Modals State
    const [ruleModalOpen, setRuleModalOpen] = React.useState(false);
    const [editingRule, setEditingRule] = React.useState<PricingRuleRecord | null>(null);
    const [ruleName, setRuleName] = React.useState('');
    const [ruleSupplierId, setRuleSupplierId] = React.useState<string>('all');
    const [ruleServiceId, setRuleServiceId] = React.useState<string>('all');
    const [ruleMarkupPct, setRuleMarkupPct] = React.useState('20');
    const [ruleFixedMarkup, setRuleFixedMarkup] = React.useState('0');
    const [ruleIsActive, setRuleIsActive] = React.useState(true);
    const [savingRule, setSavingRule] = React.useState(false);

    const [deleteRule, setDeleteRule] = React.useState<PricingRuleRecord | null>(null);
    const [deletingRule, setDeletingRule] = React.useState(false);

    // Currency Actions
    const handleOpenEditCurrency = (c: CurrencyRecord) => {
        setEditCurrency(c);
        setCurrencyRate(c.rate);
        setCurrencyActive(c.is_active);
    };

    const handleSaveCurrency = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCurrency) return;

        setSavingCurrency(true);
        router.put(`/admin/settings/currencies/${editCurrency.id}`, {
            rate: parseFloat(currencyRate),
            is_active: currencyActive,
        }, {
            onSuccess: () => {
                setSavingCurrency(false);
                setEditCurrency(null);
                toast.success(`${editCurrency.code} rate updated successfully.`);
            },
            onError: (err: any) => {
                setSavingCurrency(false);
                toast.error(err.message || 'Currency update failed.');
            },
        });
    };

    const handleCreateCurrency = (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingCurrency(true);

        router.post('/admin/settings/currencies', {
            code: newCurrencyCode.toUpperCase(),
            name: newCurrencyName,
            symbol: newCurrencySymbol,
            rate: parseFloat(newCurrencyRate),
            decimal_places: parseInt(newCurrencyDecimals, 10),
            is_active: true,
        }, {
            onSuccess: () => {
                setCreatingCurrency(false);
                setAddCurrencyOpen(false);
                setNewCurrencyCode('');
                setNewCurrencyName('');
                setNewCurrencySymbol('');
                setNewCurrencyRate('1.00');
                toast.success('New currency registered successfully.');
            },
            onError: (err: any) => {
                setCreatingCurrency(false);
                toast.error(err.message || 'Failed to create currency.');
            },
        });
    };

    // Pricing Rule Actions
    const handleOpenCreateRule = () => {
        setEditingRule(null);
        setRuleName('');
        setRuleSupplierId('all');
        setRuleServiceId('all');
        setRuleMarkupPct('20');
        setRuleFixedMarkup('0');
        setRuleIsActive(true);
        setRuleModalOpen(true);
    };

    const handleOpenEditRule = (rule: PricingRuleRecord) => {
        setEditingRule(rule);
        setRuleName(rule.name);
        setRuleSupplierId(rule.supplier_id ? String(rule.supplier_id) : 'all');
        setRuleServiceId(rule.service_id ? String(rule.service_id) : 'all');
        setRuleMarkupPct(String(rule.markup_percentage));
        setRuleFixedMarkup(String(rule.fixed_markup));
        setRuleIsActive(rule.is_active);
        setRuleModalOpen(true);
    };

    const handleSaveRule = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingRule(true);

        const payload = {
            name: ruleName,
            supplier_id: ruleSupplierId !== 'all' ? parseInt(ruleSupplierId, 10) : null,
            service_id: ruleServiceId !== 'all' ? parseInt(ruleServiceId, 10) : null,
            markup_percentage: parseFloat(ruleMarkupPct),
            fixed_markup: parseFloat(ruleFixedMarkup),
            is_active: ruleIsActive,
        };

        const req = editingRule
            ? router.put(`/admin/settings/pricing-rules/${editingRule.id}`, payload)
            : router.post('/admin/settings/pricing-rules', payload);

        req.then(() => {
            setSavingRule(false);
            setRuleModalOpen(false);
            toast.success(`Pricing rule '${ruleName}' saved successfully.`);
        }).catch((err: any) => {
            setSavingRule(false);
            toast.error(err.message || 'Failed to save pricing rule.');
        });
    };

    const handleDeleteRule = () => {
        if (!deleteRule) return;
        setDeletingRule(true);

        router.delete(`/admin/settings/pricing-rules/${deleteRule.id}`, {
            onSuccess: () => {
                setDeletingRule(false);
                setDeleteRule(null);
                toast.success(`Pricing rule '${deleteRule.name}' deleted.`);
            },
            onError: (err: any) => {
                setDeletingRule(false);
                toast.error(err.message || 'Delete rule failed.');
            },
        });
    };

    return (
        <>
            <Head title="Pricing & Multi-Currency Engine — Admin" />
            <div className="w-full space-y-6 animate-fadeIn select-none">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Pricing Rules & Multi-Currency Hub</h1>
                        <p className="text-xs text-text-secondary">Configure base foreign exchange rates, wholesale provider markups, and profit margins across services.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="text-xs flex items-center gap-1.5"
                            onClick={() => setAddCurrencyOpen(true)}
                        >
                            <PlusIcon size={14} />
                            Add Currency
                        </Button>
                        <Button
                            variant="primary"
                            className="text-xs flex items-center gap-1.5"
                            onClick={handleOpenCreateRule}
                        >
                            <PlusIcon size={14} />
                            New Pricing Rule
                        </Button>
                    </div>
                </div>

                {/* Section 1: Multi-Currency & FX Exchange Rates */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">Platform Currencies & Exchange Rates</h2>
                            <p className="text-xs text-text-muted">Live conversion multipliers relative to the platform base reference currency.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                    <th className="px-6 py-3">Currency Code</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Symbol</th>
                                    <th className="px-6 py-3 text-right font-mono">Conversion Rate</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle text-text-secondary">
                                {currencies.map((c) => (
                                    <tr key={c.id} className="hover:bg-bg-surface-hover transition-colors">
                                        <td className="px-6 py-3 font-mono font-bold text-brand">
                                            {c.code}
                                            {c.is_default && (
                                                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-xs bg-brand-subtle text-brand font-semibold">
                                                    Default Base
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 font-medium text-text-primary">
                                            {c.name}
                                        </td>
                                        <td className="px-6 py-3 font-mono font-medium text-text-primary">
                                            {c.symbol}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-semibold text-text-primary">
                                            {Number(c.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge variant={c.is_active ? 'success' : 'neutral'} dot className="text-[10px] capitalize">
                                                {c.is_active ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-xs px-2 py-1"
                                                onClick={() => handleOpenEditCurrency(c)}
                                            >
                                                Edit Rate
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2: Automated Profit Markup Rules */}
                <div className="bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-text-primary">Dynamic Markup & Profit Margin Rules</h2>
                            <p className="text-xs text-text-muted">Automated markup percentages and fixed fees layered on top of wholesale supplier costs.</p>
                        </div>
                    </div>

                    {pricingRules.length === 0 ? (
                        <div className="p-10 text-center text-xs text-text-muted">
                            No custom pricing rules configured. Platform default 20% markup is currently active.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-bg-base text-text-muted uppercase text-[10px] font-semibold border-b border-border-subtle">
                                        <th className="px-6 py-3">Rule Name</th>
                                        <th className="px-6 py-3">Target Wholesaler</th>
                                        <th className="px-6 py-3">Target Service</th>
                                        <th className="px-6 py-3 text-right font-mono">Markup %</th>
                                        <th className="px-6 py-3 text-right font-mono">Fixed Fee</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-text-secondary">
                                    {pricingRules.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-bg-surface-hover transition-colors">
                                            <td className="px-6 py-3 font-medium text-text-primary">
                                                {rule.name}
                                            </td>
                                            <td className="px-6 py-3">
                                                {rule.supplier ? (
                                                    <span className="font-medium text-text-primary">{rule.supplier.name}</span>
                                                ) : (
                                                    <span className="text-text-muted">All Suppliers</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                {rule.service ? (
                                                    <span className="font-medium text-text-primary">{rule.service.name}</span>
                                                ) : (
                                                    <span className="text-text-muted">All Services</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-semibold text-brand">
                                                +{rule.markup_percentage}%
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-text-primary">
                                                +{Number(rule.fixed_markup).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={rule.is_active ? 'success' : 'neutral'} dot className="text-[10px] capitalize">
                                                    {rule.is_active ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs px-2 py-1"
                                                        onClick={() => handleOpenEditRule(rule)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs px-2 py-1 text-error hover:bg-error-bg hover:text-error"
                                                        onClick={() => setDeleteRule(rule)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit Currency Modal */}
                {editCurrency && (
                    <Modal
                        isOpen={!!editCurrency}
                        onClose={() => setEditCurrency(null)}
                        title={`Edit Exchange Rate: ${editCurrency.code} (${editCurrency.name})`}
                    >
                        <form onSubmit={handleSaveCurrency} className="space-y-4 text-xs">
                            <Input
                                label={`Exchange Rate relative to Base Currency (1 Base = X ${editCurrency.code})`}
                                type="number"
                                step="any"
                                value={currencyRate}
                                onChange={(e) => setCurrencyRate(e.target.value)}
                                required
                            />

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="currencyActiveCheckbox"
                                    className="checkbox-base"
                                    checked={currencyActive}
                                    onChange={(e) => setCurrencyActive(e.target.checked)}
                                />
                                <label htmlFor="currencyActiveCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Currency is Active & Available for Customers
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setEditCurrency(null)}
                                    disabled={savingCurrency}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={savingCurrency}
                                >
                                    Save Exchange Rate
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Add Currency Modal */}
                {addCurrencyOpen && (
                    <Modal
                        isOpen={addCurrencyOpen}
                        onClose={() => setAddCurrencyOpen(false)}
                        title="Register New Platform Currency"
                    >
                        <form onSubmit={handleCreateCurrency} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="ISO Code (3 Letters)"
                                    placeholder="e.g. EUR"
                                    maxLength={3}
                                    value={newCurrencyCode}
                                    onChange={(e) => setNewCurrencyCode(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Currency Symbol"
                                    placeholder="e.g. €"
                                    maxLength={5}
                                    value={newCurrencySymbol}
                                    onChange={(e) => setNewCurrencySymbol(e.target.value)}
                                    required
                                />
                            </div>

                            <Input
                                label="Currency Full Name"
                                placeholder="e.g. Euro"
                                value={newCurrencyName}
                                onChange={(e) => setNewCurrencyName(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Exchange Rate to Base"
                                    type="number"
                                    step="any"
                                    value={newCurrencyRate}
                                    onChange={(e) => setNewCurrencyRate(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Decimal Precision"
                                    type="number"
                                    min="0"
                                    max="8"
                                    value={newCurrencyDecimals}
                                    onChange={(e) => setNewCurrencyDecimals(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setAddCurrencyOpen(false)}
                                    disabled={creatingCurrency}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={creatingCurrency}
                                >
                                    Create Currency
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Create / Edit Pricing Rule Modal */}
                {ruleModalOpen && (
                    <Modal
                        isOpen={ruleModalOpen}
                        onClose={() => setRuleModalOpen(false)}
                        title={editingRule ? `Edit Pricing Rule: ${editingRule.name}` : 'Create New Markup Rule'}
                    >
                        <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
                            <Input
                                label="Rule Name / Description"
                                placeholder="e.g. SMM Growth Tier 1 Markup"
                                value={ruleName}
                                onChange={(e) => setRuleName(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-primary mb-1">Target Wholesaler</label>
                                    <Select
                                        value={ruleSupplierId}
                                        onChange={(e) => setRuleSupplierId(e.target.value)}
                                        options={[
                                            { value: 'all', label: 'All Suppliers (Global)' },
                                            ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-text-primary mb-1">Target Service</label>
                                    <Select
                                        value={ruleServiceId}
                                        onChange={(e) => setRuleServiceId(e.target.value)}
                                        options={[
                                            { value: 'all', label: 'All Services (Global)' },
                                            ...services.map((s) => ({ value: String(s.id), label: `${s.name} (${s.category || ''})` })),
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Profit Markup (%)"
                                    type="number"
                                    step="0.01"
                                    placeholder="20.00"
                                    value={ruleMarkupPct}
                                    onChange={(e) => setRuleMarkupPct(e.target.value)}
                                    required
                                />

                                <Input
                                    label="Fixed Markup Surcharge"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={ruleFixedMarkup}
                                    onChange={(e) => setRuleFixedMarkup(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="ruleActiveCheckbox"
                                    className="checkbox-base"
                                    checked={ruleIsActive}
                                    onChange={(e) => setRuleIsActive(e.target.checked)}
                                />
                                <label htmlFor="ruleActiveCheckbox" className="text-xs text-text-primary font-medium cursor-pointer">
                                    Rule is Active & Applied Automatically to Orders
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setRuleModalOpen(false)}
                                    disabled={savingRule}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={savingRule}
                                >
                                    {editingRule ? 'Update Rule' : 'Create Rule'}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Delete Rule Confirmation Modal */}
                {deleteRule && (
                    <Modal
                        isOpen={!!deleteRule}
                        onClose={() => setDeleteRule(null)}
                        title={`Delete Pricing Rule: ${deleteRule.name}`}
                    >
                        <div className="space-y-4 text-xs">
                            <p className="text-text-secondary leading-relaxed">
                                Are you sure you want to delete the pricing rule <strong className="text-text-primary">'{deleteRule.name}'</strong>? Services covered by this rule will fallback to the platform default markup.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setDeleteRule(null)}
                                    disabled={deletingRule}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleDeleteRule}
                                    isLoading={deletingRule}
                                >
                                    Confirm Delete
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}

AdminPricingSettings.layout = (page: React.ReactNode) => <AdminAppShell>{page}</AdminAppShell>;

