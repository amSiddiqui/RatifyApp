import { Skeleton, Stack } from '@mantine/core';
import React from 'react';


const templateImages = [1, 2, 3];

const DocumentCarouselLoading:React.FC = () => {
    return <>{templateImages.map((t) => {
        return (
            <Stack className="mr-5" key={t}>
                <Skeleton width={116} height={150} />
                <Skeleton width={116} height={10} />
            </Stack>
        );
    })}</>
}

export default DocumentCarouselLoading;