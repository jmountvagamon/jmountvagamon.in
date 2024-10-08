import {
  createStyles,
  Text,
  Container,
  ActionIcon,
  Group,
  Box,
} from "@mantine/core";
import {
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandFacebook,
  IconBrandTwitter,
} from "@tabler/icons";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CollectionName } from "./data/constants";
import { db } from "./data/firebaseConfig";

const currentYear = new Date().getFullYear();

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 20,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  logo: {
    maxWidth: 200,

    [theme.fn.smallerThan("sm")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },

  description: {
    marginTop: 5,

    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  groups: {
    display: "flex",
    flexWrap: "wrap",

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  wrapper: {
    width: 160,
  },

  link: {
    display: "block",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    paddingTop: 3,
    paddingBottom: 3,

    "&:hover": {
      textDecoration: "underline",
    },
  },

  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xs / 2,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  afterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  social: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
    },
  },
}));

interface FooterLinksProps {
  data: {
    title: string;
    links: { label: string; link: string; blank?: boolean }[];
  }[];
}

export default function FooterLinks({ data }: FooterLinksProps) {
  const { classes } = useStyles();
  const [values, setValues] = useState<ContactData>();

  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text
        key={index}
        className={classes.link}
        component={Link}
        href={link.link}
        target={link.blank ? "_blank" : "_self"}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });
  useEffect(() => {
    const run = async () => {
      const docRef = doc(db, CollectionName.PAGES, "contacts");
      const docSnap = await getDoc(docRef);
      setValues({ ...docSnap.data() } as ContactData);
    };
    run();
  }, []);

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          JMount Resorts
          <Box className={classes.description}>
            <Text size="xs" color="dimmed">
              JMount Vagamon
            </Text>
            <Text size="xs" color="dimmed">
              Kannamkulam, Vagamon
            </Text>
            <Text size="xs" color="dimmed">
              Kerala - 685503
            </Text>
            <Text size="xs" color="dimmed">
              Contact: +91 88488 86990
            </Text>
          </Box>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text color="dimmed" size="sm">
          © {currentYear} jmountvagamon.in | All rights reserved.
        </Text>

        <Group mt="xl" className={classes.social}>
                <ActionIcon
                  component={Link}
                  href={values?.twitter || ""}
                  size={28}
                  className={classes.social}
                  variant="transparent"
                >
                  <IconBrandTwitter size={22} stroke={1.5} />
                </ActionIcon>
                <ActionIcon
                  component={Link}
                  href={values?.instagram || ""}
                  size={28}
                  className={classes.social}
                  variant="transparent"
                >
                  <IconBrandInstagram size={22} stroke={1.5} />
                </ActionIcon>
                <ActionIcon
                  component={Link}
                  href={values?.facebook || ""}
                  size={28}
                  className={classes.social}
                  variant="transparent"
                >
                  <IconBrandFacebook size={22} stroke={1.5} />
                </ActionIcon>
                <ActionIcon
                  component={Link}
                  href={values?.whatsapp || ""}
                  size={28}
                  className={classes.social}
                  variant="transparent"
                >
                  <IconBrandWhatsapp size={22} stroke={1.5} />
                </ActionIcon>
              </Group>
      </Container>
    </footer>
  );
}
