import React from 'react';
import { Progress, Group } from '@mantine/core';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { AgreementProgressSectionType } from '../../../../types/ContractTypes';

type Props = {
    contractHelper: ContractHelper;
    contractId?: string;
    getSections?: (sections:AgreementProgressSectionType[]) => void;
    token?: string;
}

const AgreementProgressBar:React.FC<Props> = ({contractHelper, contractId, token, getSections}) => {
    const [progressSections, setProgressSections] = React.useState<AgreementProgressSectionType[]>([]);
    const [[overallProgress, overallTotalProgress], setOverallProgress] = React.useState<[number, number]>([0, 0]);
    

    React.useEffect(() => {
        if (token) {
            contractHelper.getSignerProgress(token).then(dt => {
                setProgressSections(dt.sections);
                if (getSections) {
                    getSections(dt.sections);
                }
                setOverallProgress([dt.progress, dt.total]);
            }).catch(err => {
                console.log(err);
            })
        } else {
            if (contractId) {
                contractHelper.getSignerSenderProgress(contractId).then((dt) => {
                    setOverallProgress([dt.progress, dt.total]);
                    setProgressSections(dt.sections);
                    if (getSections) {
                        getSections(dt.sections);
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    }, [contractHelper, token, contractId, getSections]);


    return <div>
        <Progress style={{ width: 300 }} className='h-3' sections={progressSections}/>
        <Group style={{ width: 300 }} position='apart'>
            <p className='text-muted text-xs'>Actions completed:</p>
            <p className='text-muted text-xs'>{overallProgress}/{overallTotalProgress}</p>
        </Group>
    </div>;
}

export default AgreementProgressBar;