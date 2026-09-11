'use client';

import { useState, useEffect } from 'react';
import {
  Network,
  Copy,
  Check,
  Server,
  Globe,
  Sliders,
  RefreshCw,
  Info,
  Laptop,
} from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import type { Tool } from '@/lib/tool-registry';

interface NetworkToolProps {
  tool: Tool;
}

// Helper to convert IPv4 string to integer
function ipToInt(ip: string): number {
  return (
    ip
      .split('.')
      .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0) >>> 0
  );
}

// Helper to convert integer to IPv4 string
function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

// Helper to get subnet mask from CIDR
function cidrToMask(cidr: number): string {
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  return intToIp(mask);
}

export function NetworkTool({ tool }: NetworkToolProps) {
  const slug = tool.slug;
  const [copied, setCopied] = useState<string | null>(null);

  // 1. IPv4 / CIDR / Subnet Calculator states
  const [ip, setIp] = useState('192.168.1.50');
  const [cidr, setCidr] = useState(24);

  // 2. IPv6 states
  const [ipv6Input, setIpv6Input] = useState('2001:0db8:85a3:0000:0000:8a2e:0370:7334');

  // 3. Binary states
  const [binaryInput, setBinaryInput] = useState('11000000101010000000000100110010');
  const [decimalInput, setDecimalInput] = useState('42');

  // 4. MAC states
  const [macCount, setMacCount] = useState(4);
  const [macSep, setMacSep] = useState<':' | '-' | '.'>(':');
  const [macList, setMacList] = useState<string[]>([]);

  // 5. User Agent
  const [uaString, setUaString] = useState('');

  const copyVal = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Compute IPv4 / CIDR details
  const cleanIp = ip.trim();
  const validIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanIp);
  const ipInt = validIp ? ipToInt(cleanIp) : 0;
  const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const wildcardInt = ~maskInt >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const subnetMask = cidrToMask(cidr);
  const wildcardMask = intToIp(wildcardInt);
  const networkAddr = intToIp(networkInt);
  const broadcastAddr = intToIp(broadcastInt);

  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

  const firstHost = cidr >= 31 ? networkAddr : intToIp(networkInt + 1);
  const lastHost = cidr >= 31 ? broadcastAddr : intToIp(broadcastInt - 1);
  const hostRange = `${firstHost} – ${lastHost}`;

  // IP Class
  const firstOctet = parseInt(cleanIp.split('.')[0], 10) || 0;
  let ipClass = 'Class C';
  let isPrivate = false;
  if (firstOctet >= 1 && firstOctet <= 126) {
    ipClass = 'Class A';
    if (firstOctet === 10) isPrivate = true;
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    ipClass = 'Class B';
    if (firstOctet === 172) isPrivate = true;
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    ipClass = 'Class C';
    if (cleanIp.startsWith('192.168.')) isPrivate = true;
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    ipClass = 'Class D (Multicast)';
  } else if (firstOctet >= 240) {
    ipClass = 'Class E (Experimental)';
  }

  // IPv6 Calculation
  const expandIpv6 = (v6: string) => {
    try {
      let full = v6.trim().toLowerCase();
      if (full.includes('::')) {
        const sides = full.split('::');
        const left = sides[0] ? sides[0].split(':') : [];
        const right = sides[1] ? sides[1].split(':') : [];
        const missing = 8 - (left.length + right.length);
        const middle = Array(missing).fill('0000');
        const parts = [...left, ...middle, ...right];
        return parts.map((p) => p.padStart(4, '0')).join(':');
      }
      return full
        .split(':')
        .map((p) => p.padStart(4, '0'))
        .join(':');
    } catch {
      return v6;
    }
  };

  const compressIpv6 = (v6: string) => {
    try {
      const expanded = expandIpv6(v6);
      return expanded
        .split(':')
        .map((p) => p.replace(/^0+/, '') || '0')
        .join(':')
        .replace(/(^|:)0(:0)+(:|$)/, '::');
    } catch {
      return v6;
    }
  };

  // Generate MAC
  const generateMacs = () => {
    const list: string[] = [];
    const hexChars = '0123456789ABCDEF';
    for (let i = 0; i < macCount; i++) {
      const octets: string[] = [];
      for (let j = 0; j < 6; j++) {
        // Ensure unicast (lowest bit of first octet is 0)
        let o = hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
        if (j === 0) o = o[0] + '2468ACE'[Math.floor(Math.random() * 7)];
        octets.push(o);
      }
      list.push(octets.join(macSep));
    }
    setMacList(list);
  };

  useEffect(() => {
    if (slug.includes('mac')) generateMacs();
    if (slug.includes('user-agent') && typeof navigator !== 'undefined') {
      setUaString(navigator.userAgent);
    }
  }, [slug, macSep, macCount]);

  // -------------------------------------------------------------------------
  // MAC GENERATOR VIEW
  // -------------------------------------------------------------------------
  if (slug.includes('mac')) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Delimiter:</span>
            {([':', '-', '.'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setMacSep(s)}
                className={`h-8 w-8 rounded-lg font-mono font-bold text-xs ${
                  macSep === s ? 'bg-emerald-500 text-white shadow' : 'border text-stone-600 dark:text-stone-400'
                }`}
                style={{ borderColor: 'var(--border)' }}
              >
                {s}
              </button>
            ))}
          </div>

          <ClayButton variant="primary" onClick={generateMacs} className="flex items-center gap-2 py-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Generate New MACs
          </ClayButton>
        </div>

        <div className="space-y-2">
          {macList.map((mac, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border p-3.5 font-mono text-sm font-bold shadow-sm"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <span className="text-emerald-700 dark:text-emerald-400">{mac}</span>
              <button
                onClick={() => copyVal(mac, `mac-${idx}`)}
                className="flex items-center gap-1 text-xs font-sans text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                {copied === `mac-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === `mac-${idx}` ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // USER AGENT PARSER VIEW
  // -------------------------------------------------------------------------
  if (slug.includes('user-agent')) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border p-5 shadow-sm space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            User Agent String
          </label>
          <textarea
            rows={3}
            value={uaString}
            onChange={(e) => setUaString(e.target.value)}
            className="w-full rounded-xl border p-3 font-mono text-xs focus:border-emerald-500 focus:outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="block text-xs font-bold text-stone-500 mb-1">Platform / OS</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
              {uaString.includes('Windows')
                ? 'Windows NT'
                : uaString.includes('Mac')
                ? 'macOS'
                : uaString.includes('Linux')
                ? 'Linux'
                : uaString.includes('Android')
                ? 'Android'
                : uaString.includes('iPhone')
                ? 'iOS'
                : 'Unknown'}
            </span>
          </div>
          <div className="rounded-xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="block text-xs font-bold text-stone-500 mb-1">Browser Engine</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
              {uaString.includes('Edg')
                ? 'Microsoft Edge (Chromium)'
                : uaString.includes('Chrome')
                ? 'Google Chrome / Blink'
                : uaString.includes('Firefox')
                ? 'Mozilla Firefox / Gecko'
                : uaString.includes('Safari')
                ? 'Apple Safari / WebKit'
                : 'Standard WebKit'}
            </span>
          </div>
          <div className="rounded-xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="block text-xs font-bold text-stone-500 mb-1">Device Class</span>
            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
              {/Mobi|Android|iPhone/i.test(uaString) ? 'Mobile Device' : 'Desktop / Workstation'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // IP TO BINARY / BINARY TO DECIMAL
  // -------------------------------------------------------------------------
  if (slug.includes('ip-to-binary')) {
    const octets = cleanIp.split('.');
    const binaryIp = octets
      .map((o) => (parseInt(o, 10) || 0).toString(2).padStart(8, '0'))
      .join('.');

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
              IPv4 Dotted Decimal
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full rounded-xl border px-3.5 py-2.5 font-mono text-base font-bold focus:border-emerald-500 focus:outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                32-Bit Binary Representation
              </span>
              <button
                onClick={() => copyVal(binaryIp, 'binip')}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
              >
                {copied === 'binip' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === 'binip' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="rounded-xl border p-4 font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
              {binaryIp}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slug.includes('binary-to-decimal')) {
    const decVal = parseInt(binaryInput.replace(/\s+/g, ''), 2);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Binary String
            </label>
            <input
              type="text"
              value={binaryInput}
              onChange={(e) => setBinaryInput(e.target.value.replace(/[^01]/g, ''))}
              className="w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div className="rounded-2xl border p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Decimal Value
            </label>
            <div className="rounded-xl border px-3.5 py-2.5 font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
              {isNaN(decVal) ? 'Invalid' : decVal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // IPv6 CALCULATOR
  // -------------------------------------------------------------------------
  if (slug.includes('ipv6')) {
    const expanded = expandIpv6(ipv6Input);
    const compressed = compressIpv6(ipv6Input);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border p-5 shadow-sm space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            IPv6 Address Input
          </label>
          <input
            type="text"
            value={ipv6Input}
            onChange={(e) => setIpv6Input(e.target.value)}
            className="w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Expanded (Full 128-Bit)
              </span>
              <button onClick={() => copyVal(expanded, 'exp')} className="text-stone-400 hover:text-stone-700">
                {copied === 'exp' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="font-mono text-xs font-bold break-all text-stone-800 dark:text-stone-200">{expanded}</p>
          </div>

          <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Compressed (RFC 5952)
              </span>
              <button onClick={() => copyVal(compressed, 'comp')} className="text-stone-400 hover:text-stone-700">
                {copied === 'comp' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="font-mono text-xs font-bold break-all text-emerald-600 dark:text-emerald-400">{compressed}</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // DEFAULT: IPv4 / CIDR / SUBNET CALCULATOR
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
              IP Address
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full rounded-xl border px-3.5 py-2.5 font-mono text-base font-bold focus:border-emerald-500 focus:outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>
          <div className="sm:col-span-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
              CIDR Prefix (/{cidr})
            </label>
            <select
              value={cidr}
              onChange={(e) => setCidr(parseInt(e.target.value))}
              className="w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              {Array.from({ length: 33 }, (_, i) => (
                <option key={i} value={i}>
                  /{i} ({cidrToMask(i)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick CIDR buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          {[
            { c: 8, l: '/8 (Class A)' },
            { c: 16, l: '/16 (Class B)' },
            { c: 24, l: '/24 (Class C - 254 hosts)' },
            { c: 28, l: '/28 (14 hosts)' },
            { c: 30, l: '/30 (P2P - 2 hosts)' },
          ].map((item) => (
            <button
              key={item.c}
              type="button"
              onClick={() => setCidr(item.c)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                cidr === item.c
                  ? 'bg-emerald-500 text-white'
                  : 'border bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
              style={{ borderColor: 'var(--border)' }}
            >
              {item.l}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold text-stone-500">Network Address</span>
          <div className="mt-1 flex items-center justify-between font-mono font-bold text-base" style={{ color: 'var(--ink)' }}>
            <span>{networkAddr}</span>
            <button onClick={() => copyVal(networkAddr, 'net')} className="text-stone-400 hover:text-stone-700">
              {copied === 'net' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold text-stone-500">Broadcast Address</span>
          <div className="mt-1 flex items-center justify-between font-mono font-bold text-base" style={{ color: 'var(--ink)' }}>
            <span>{broadcastAddr}</span>
            <button onClick={() => copyVal(broadcastAddr, 'bcast')} className="text-stone-400 hover:text-stone-700">
              {copied === 'bcast' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold text-stone-500">Subnet Mask</span>
          <div className="mt-1 flex items-center justify-between font-mono font-bold text-base" style={{ color: 'var(--ink)' }}>
            <span>{subnetMask}</span>
            <button onClick={() => copyVal(subnetMask, 'mask')} className="text-stone-400 hover:text-stone-700">
              {copied === 'mask' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold text-stone-500">Wildcard Mask</span>
          <div className="mt-1 flex items-center justify-between font-mono font-bold text-base" style={{ color: 'var(--ink)' }}>
            <span>{wildcardMask}</span>
            <button onClick={() => copyVal(wildcardMask, 'wild')} className="text-stone-400 hover:text-stone-700">
              {copied === 'wild' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm sm:col-span-2" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold text-stone-500">Usable Host Range</span>
          <div className="mt-1 flex items-center justify-between font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
            <span>{hostRange}</span>
            <button onClick={() => copyVal(hostRange, 'range')} className="text-stone-400 hover:text-stone-700">
              {copied === 'range' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold text-stone-500">Total Available Hosts</span>
          <p className="mt-1 font-mono font-bold text-lg" style={{ color: 'var(--ink)' }}>
            {totalHosts.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-bold text-stone-500">Usable Hosts</span>
          <p className="mt-1 font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
            {usableHosts.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
