import { useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "../TapsPanel/TapsPanel";
import SectionTitle from "../SectionTitle";
import { Grid } from "@material-ui/core";

function a11yProps(index: number | string) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabMenu(props: any) {
  const { children, labels, title } = props;
  const [value, setValue] = useState(0);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Grid container>
      {title && (
        <Grid item xs={12}>
          <SectionTitle title={title} />
        </Grid>
      )}
      <Grid item xs={3}>
        <Tabs
          orientation="vertical"
          value={value}
          indicatorColor="primary"
          onChange={handleChange}
          aria-label="Vertical tabs"
        >
          {labels.map((label: string) => (
            <Tab
              label={label}
              key={label}
              {...a11yProps(labels.indexOf(label))}
            />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={9}>
        {children.map((Children: any, index: number) => (
          <TabPanel value={value} index={index} key={Children.type.name}>
            {Children}
          </TabPanel>
        ))}
      </Grid>
    </Grid>
  );
}
