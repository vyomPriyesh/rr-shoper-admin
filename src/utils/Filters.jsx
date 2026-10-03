import React from 'react'
import InputField from './InputField'
import { filterState } from '../context/Filtercontext'

const Filters = () => {

    const { filtersData, handlefilters } = filterState();

    return (
        <div>
            <InputField placeholder='Search Here' value={filtersData?.value} onChange={(e) => handlefilters('search',e.target.value)} />
        </div>
    )
}

export default Filters
