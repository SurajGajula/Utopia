using UnityEngine;
using System.Collections;
using System.Linq;
using UnityEngine.UI;
using System.Threading.Tasks;
using TMPro;
public class Battle : MonoBehaviour
{
    public Stats[] allies;
    public Stats enemy;
    public Healthbar[] allybars;
    public Healthbar enemybar;
    public int pChain;
    public int eChain;
    public TextMeshProUGUI[] skills;
    public int curAlly;
    public TextMeshProUGUI chainTxt;
    public Menu menu;
    public GameObject battlescreen;
    public GameObject damagefab;
    public async void BattleStart()
    {
        battlescreen.SetActive(true);
        menu.gameObject.SetActive(false);
        await InitializeAllies();
        await InitializeEnemy();
        SetSkills(0);
        pChain = 3;
        SetChain();
    }
    private async Task InitializeAllies()
    {
        for (int i = 0; i < 3; i++)
        {
            GameObject allyInstance = Instantiate(menu.allies[i].gameObject, new Vector3(-2 * (i - 1), -1, 0), Quaternion.identity);
            allyInstance.name = allyInstance.name.Replace("(Clone)", "");
            allies[i] = allyInstance.GetComponent<Stats>();
            await allies[i].GetStats(allies[i].gameObject.name);
            allybars[i].maxHealth = allies[i].health;
            allybars[i].SetFill(allies[i].health);
        }
    }
    private async Task InitializeEnemy()
    {
        GameObject enemyInstance = Instantiate(menu.enemies[0].gameObject, new Vector3(10, 0.89f, 0), Quaternion.identity);
        enemy = enemyInstance.GetComponent<Stats>();
        await enemy.GetStats("The Power Disinter", false);
        enemybar.maxHealth = enemy.health;
        enemybar.SetFill(enemy.health);
    }
    public void PSkill(int index)
    {
        if (pChain > 0)
        {
            int damage = 10;
            StartCoroutine(ShowDamage(damage));
            enemy.health -= damage;
            enemybar.SetFill(enemy.health);
            if (enemy.health <= 0)
            {
                BattleEnd(true);
                return;
            }
            pChain -= 1;
            if (pChain == 0)
            {
                eChain = 3;
                StartCoroutine(ESkill());
            }
            SetChain();
        }
    }
    public IEnumerator ESkill()
    {
        while (eChain > 0)
        {
            int target = Random.Range(0, 3);
            int index = Random.Range(0, 3);
            int damage = 10;
            StartCoroutine(ShowDamage(damage, target));
            allies[target].health -= damage;
            allybars[target].SetFill(allies[target].health);
            yield return new WaitForSeconds(1f);
            eChain -= 1;
            SetChain();
        }
        if (allies.Any(ally => ally.health <= 0))
        {
            BattleEnd(false);
            yield break;
        }
        pChain = 3;
        SetChain();
    }
    public async void BattleEnd(bool won)
    {
        Destroy(enemy.gameObject);
        if (won)
        {
            pChain = 0;
            foreach (var ally in allies)
            {
                await ally.PutExp(ally.gameObject.name, 100);
            }
        }
        menu.gameObject.SetActive(true);
        System.Array.ForEach(allies, ally => Destroy(ally.gameObject));
        battlescreen.gameObject.SetActive(false);
    }
    public void SetSkills(int index)
    {
        curAlly = index;
        for (int i = 0; i < 3; i++)
        {
            skills[i].text = allies[curAlly].skillnames[i];
        }
    }
    public void SetChain()
    {
        chainTxt.text = (pChain > 0 ? "Player Chain: " + pChain : "Enemy Chain: " + eChain);
    }
    public IEnumerator ShowDamage(int damage, int target = 0)
    {
        Vector3 spawn = (pChain == 0 ? allies[target].transform.position + Vector3.left : enemy.transform.position + Vector3.right) + Vector3.up;
        GameObject damageTextInstance = Instantiate(damagefab, spawn, Quaternion.identity);
        damageTextInstance.transform.SetParent(transform, true);
        TextMeshProUGUI damageText = damageTextInstance.GetComponent<TextMeshProUGUI>();
        damageText.text = damage.ToString();
        for (float elapsedTime = 0f; elapsedTime < 0.5f; elapsedTime += Time.deltaTime)
        {
            damageTextInstance.transform.Translate(Vector3.up * 2 * Time.deltaTime);
            yield return null;
        }
        Destroy(damageTextInstance);
    }
}