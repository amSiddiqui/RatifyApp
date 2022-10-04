import { Group, Stack } from '@mantine/core';
import React from 'react';
import { BrowserData, SignerMetaData } from '../../../types/ContractTypes';

const regionNames = new Intl.DisplayNames(['en'], { type: 'language' });

const ShowBrowserData: React.FC<{
    signerMeta?: SignerMetaData;
    browserData?: BrowserData;
}> = ({ signerMeta, browserData }) => {
    return (
        <div>
            {signerMeta && browserData && (
                <Stack className="p-4">
                    <Group>
                        <p className="font-bold">Hash: </p>
                        <p className="flex-wrap">{signerMeta.meta_hash}</p>
                    </Group>
                    {browserData.ip_address && (
                        <Group>
                            <p className="font-bold">IP Address: </p>
                            <p>{browserData.ip_address}</p>
                        </Group>
                    )}
                    {browserData.browserName && (
                        <Group>
                            <p className="font-bold">Browser Name: </p>
                            <p>{browserData.browserName}</p>
                        </Group>
                    )}
                    {browserData.browserVersion && (
                        <Group>
                            <p className="font-bold">Browser Version: </p>
                            <p>{browserData.browserVersion}</p>
                        </Group>
                    )}
                    {browserData.os && (
                        <Group>
                            <p className="font-bold">Operating System: </p>
                            <p>{browserData.os}</p>
                        </Group>
                    )}
                    {browserData.osVersion && (
                        <Group>
                            <p className="font-bold">OS Version: </p>
                            <p>{browserData.osVersion}</p>
                        </Group>
                    )}
                    {browserData.language && (
                        <Group>
                            <p className="font-bold">Device Language: </p>
                            <p>{regionNames.of(browserData.language)}</p>
                        </Group>
                    )}
                    {browserData.localTime && (
                        <Group>
                            <p className="font-bold">Local Time: </p>
                            <p>{browserData.localTime}</p>
                        </Group>
                    )}

                    {browserData.resolution && (
                        <Group>
                            <p className="font-bold">Screen Resolution: </p>
                            <p>{browserData.resolution}</p>
                        </Group>
                    )}

                    {browserData.userAgent && (
                        <Group>
                            <p className="font-bold">User Agent: </p>
                            <p>{browserData.userAgent}</p>
                        </Group>
                    )}

                    {browserData.platformType && (
                        <Group>
                            <p className="font-bold">Platform Type: </p>
                            <p>{browserData.platformType}</p>
                        </Group>
                    )}

                    {browserData.platformVendor && (
                        <Group>
                            <p className="font-bold">Platform Vendor: </p>
                            <p>{browserData.platformVendor}</p>
                        </Group>
                    )}

                    {browserData.logicalCores && (
                        <Group>
                            <p className="font-bold">CPU Cores: </p>
                            <p>{browserData.logicalCores} cores</p>
                        </Group>
                    )}
                </Stack>
            )}

            {(!signerMeta || !browserData) && (
                <Stack className="p-4">
                    {/* print data not available */}
                    <p>Signer Meta Information not available for this signer</p>
                </Stack>
            )}
        </div>
    );
};

export default ShowBrowserData;
