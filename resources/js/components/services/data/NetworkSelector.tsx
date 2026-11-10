import * as React from 'react';
import { NetworkItem } from './types';
import { NetworkCard } from './NetworkCard';

interface NetworkSelectorProps {
    networks: NetworkItem[];
    selectedNetworkId: string;
    onSelectNetwork: (id: string) => void;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
    networks,
    selectedNetworkId,
    onSelectNetwork,
}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-3.5">
            {networks.map(net => (
                <NetworkCard
                    key={net.id}
                    network={net}
                    isSelected={selectedNetworkId === net.id}
                    onSelect={onSelectNetwork}
                />
            ))}
        </div>
    );
};
